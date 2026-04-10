from flask import Blueprint, request, jsonify, send_file
from fb.admin import verify_token, db
from services.gemini import extract_from_images
from services.pdf_generator import generate_final_pdf
from datetime import datetime, timezone
import io
import os
os.environ['CUDA_VISIBLE_DEVICES']  = ''   # disable GPU search
os.environ['ORT_LOGGING_LEVEL']     = '3'  # suppress onnx warnings

fayda_bp = Blueprint('fayda', __name__)

# ── Credit cost per template ──
CREDIT_COST = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
}

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def get_user_credits(user_id):
    doc = db.collection('users').document(user_id).get()
    if doc.exists:
        return doc.to_dict().get('credits', 0)
    return 0

def deduct_credits(user_id, amount):
    user_ref = db.collection('users').document(user_id)
    user     = user_ref.get()
    if not user.exists:
        return False, "User not found"
    current_credits = user.to_dict().get('credits', 0)
    if current_credits < amount:
        return False, f"Insufficient credits. You have {current_credits} but need {amount}"
    user_ref.update({'credits': current_credits - amount})
    return True, current_credits - amount

# ============================================================
# ENDPOINT 1 — Extract Image Data
# ============================================================

@fayda_bp.route('/extract-image-data', methods=['POST'])
def extract_image_data():

    # Step 1: Verify Firebase token
    try:
        email = verify_token(request)
    except Exception as e:
        return jsonify({'error': str(e)}), 401

    # Step 2: Validate uploaded files
    if 'front_image' not in request.files:
        return jsonify({'error': 'front_image is required'}), 400
    if 'back_image' not in request.files:
        return jsonify({'error': 'back_image is required'}), 400
    if 'photo_qr_image' not in request.files:
        return jsonify({'error': 'photo_qr_image is required'}), 400

    front    = request.files['front_image']
    back     = request.files['back_image']
    photo_qr = request.files['photo_qr_image']

    # Step 3: Validate file types
    allowed = {'image/jpeg', 'image/png', 'image/jpg', 'image/webp'}
    for f in [front, back, photo_qr]:
        if f.mimetype not in allowed:
            return jsonify({'error': f'Invalid file type: {f.mimetype}'}), 400

    # Step 4: Run Gemini AI extraction
    try:
        extracted_texts, profile_b64, qr_b64 = extract_from_images(
            front, back, photo_qr
        )
    except Exception as e:
        return jsonify({'error': f'Error extracting data: {str(e)}'}), 500

    # Step 5: Return extracted data + images
    return jsonify({
        'status': 'extracted',
        'data': {
            'extracted_texts': extracted_texts,
            'profile_image':   profile_b64,
            'qr_image':        qr_b64
        }
    }), 200

# ============================================================
# ENDPOINT 2 — Generate Final ID (direct, no queue)
# ============================================================

@fayda_bp.route('/generate-final-id', methods=['POST'])
def generate_final_id():

    # Step 1 — Verify token
    try:
        email = verify_token(request)
    except Exception as e:
        return jsonify({'error': str(e)}), 401

    # Step 2 — Get request data
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    # Step 3 — Validate cards data
    cards_data = data.get('cards', [])
    if not cards_data:
        return jsonify({'error': 'No cards data provided'}), 400

    template_count = len(cards_data)
    if template_count < 1 or template_count > 5:
        return jsonify({'error': 'Cards must be between 1 and 5'}), 400

    # Step 4 — Merge edited texts into extracted texts
    for card in cards_data:
        extracted = card.get('extracted_texts', {})
        edited    = card.get('edited_texts', {})
        extracted.update(edited)
        card['extracted_texts'] = extracted

    # Step 5 — Generate PDF
    try:
        pdf_bytes = generate_final_pdf(cards_data, template_count)
    except Exception as e:
        return jsonify({'error': f'PDF generation failed: {str(e)}'}), 500

    # Step 6 — Return PDF
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype='application/pdf',
        as_attachment=True,
        download_name='fayda_id_cards.pdf'
    )

# ============================================================
# ENDPOINT 3 — Add to Queue
# ============================================================

@fayda_bp.route('/add-to-queue', methods=['POST'])
def add_to_queue():

    # Step 1 — Verify token
    try:
        user_id = verify_token(request)
    except Exception as e:
        return jsonify({'error': str(e)}), 401

    # Step 2 — Parse body
    body = request.get_json()
    if not body:
        return jsonify({'error': 'Request body is required'}), 400

    # Step 3 — Validate fields
    cards          = body.get('cards', [])
    template_count = body.get('template_count', 1)

    if not cards:
        return jsonify({'error': 'cards array is required'}), 400

    if template_count not in CREDIT_COST:
        return jsonify({'error': 'template_count must be between 1 and 5'}), 400

    # Step 4 — Validate each card
    for i, card in enumerate(cards):
        if 'extracted_texts' not in card:
            return jsonify({'error': f'Card {i+1} is missing extracted_texts'}), 400
        if 'profile_image' not in card:
            return jsonify({'error': f'Card {i+1} is missing profile_image'}), 400
        if 'qr_image' not in card:
            return jsonify({'error': f'Card {i+1} is missing qr_image'}), 400

    # Step 5 — Calculate credit cost
    credit_cost     = CREDIT_COST[template_count]
    current_credits = get_user_credits(user_id)

    print(f"💳 User [{user_id}] credits: {current_credits} | Cost: {credit_cost}")

    # Step 6 — Check credits
    if current_credits < credit_cost:
        return jsonify({
            'status':           'error',
            'message':          f'Insufficient credits. You have {current_credits} but need {credit_cost}',
            'current_credits':  current_credits,
            'required_credits': credit_cost,
        }), 402

    # Step 7 — Deduct credits
    success, result = deduct_credits(user_id, credit_cost)
    if not success:
        return jsonify({'error': result}), 402

    remaining_credits = result
    print(f"✅ Credits deducted. Remaining: {remaining_credits}")

    # Step 8 — Merge edited texts
    for card in cards:
        extracted = card.get('extracted_texts', {})
        edited    = card.get('edited_texts', {})
        extracted.update(edited)
        card['extracted_texts'] = extracted

    # Step 9 — Build job data
    now      = datetime.now(timezone.utc).isoformat()
    job_data = {
        'user_id':        user_id,
        'template_count': template_count,
        'credit_cost':    credit_cost,
        'cards':          cards,
        'status':         'pending',
        'created_at':     now,
        'updated_at':     now,
        'result_url':     None,
        'error':          None,
    }

    # Step 10 — Save to Firestore
    doc_ref            = db.collection('print_queue').document()
    job_data['job_id'] = doc_ref.id
    doc_ref.set(job_data)

    print(f"✅ Job [{doc_ref.id}] added to queue for user [{user_id}]")

    return jsonify({
        'status':            'success',
        'message':           'Job added to queue successfully',
        'job_id':            doc_ref.id,
        'template_count':    template_count,
        'credit_cost':       credit_cost,
        'remaining_credits': remaining_credits,
    }), 200

# ============================================================
# ENDPOINT 4 — Queue Status (check single job)
# ============================================================

@fayda_bp.route('/queue-status/<job_id>', methods=['GET'])
def queue_status(job_id):

    # Step 1 — Verify token
    try:
        user_id = verify_token(request)
    except Exception as e:
        return jsonify({'error': str(e)}), 401

    # Step 2 — Get job from Firestore
    doc = db.collection('print_queue').document(job_id).get()
    if not doc.exists:
        return jsonify({'error': f'Job {job_id} not found'}), 404

    job = doc.to_dict()

    # Step 3 — Security: only owner can check their job
    if job.get('user_id') != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    return jsonify({
        'status':         'success',
        'job_id':         job_id,
        'job_status':     job.get('status'),
        'template_count': job.get('template_count'),
        'credit_cost':    job.get('credit_cost'),
        'created_at':     job.get('created_at'),
        'result_url':     job.get('result_url'),
        'error':          job.get('error'),
    }), 200

# ============================================================
# ENDPOINT 5 — My Jobs (get all jobs for user)
# ============================================================

@fayda_bp.route('/my-jobs', methods=['GET'])
def my_jobs():

    # Step 1 — Verify token
    try:
        user_id = verify_token(request)
    except Exception as e:
        return jsonify({'error': str(e)}), 401

    # Step 2 — Get all jobs for this user (sorted in Python)
    try:
        jobs_ref = db.collection('print_queue')\
                     .where('user_id', '==', user_id)\
                     .stream()

        jobs_list = sorted(
            [{'job_id': j.id, **j.to_dict()} for j in jobs_ref],
            key=lambda x: x.get('created_at', ''),
            reverse=True
        )[:20]  # limit to 20

    except Exception as e:
        return jsonify({'error': f'Failed to fetch jobs: {str(e)}'}), 500

    result = []
    for j in jobs_list:
        result.append({
            'job_id':         j.get('job_id'),
            'job_status':     j.get('status'),
            'template_count': j.get('template_count'),
            'credit_cost':    j.get('credit_cost'),
            'created_at':     j.get('created_at'),
            'result_url':     j.get('result_url'),
        })

    return jsonify({
        'status': 'success',
        'jobs':   result,
        'total':  len(result),
    }), 200

# ============================================================
# ENDPOINT 6 — Process Queue
# ============================================================

@fayda_bp.route('/process-queue', methods=['POST'])
def process_queue():

    # Step 1 — Verify token
    try:
        user_id = verify_token(request)
    except Exception as e:
        return jsonify({'error': str(e)}), 401

    # Step 2 — Get all pending jobs for this user (sorted in Python)
    try:
        jobs_ref = db.collection('print_queue')\
                     .where('user_id', '==', user_id)\
                     .where('status', '==', 'pending')\
                     .stream()

        jobs = sorted(
            [{'job_id': j.id, **j.to_dict()} for j in jobs_ref],
            key=lambda x: x.get('created_at', '')
        )
    except Exception as e:
        return jsonify({'error': f'Failed to fetch queue: {str(e)}'}), 500

    # Step 3 — Check if queue is empty
    if not jobs:
        return jsonify({
            'status':  'error',
            'message': 'No pending jobs in queue'
        }), 400

    # Step 4 — Check max 5 cards
    if len(jobs) > 5:
        return jsonify({
            'status':  'error',
            'message': f'Queue has {len(jobs)} jobs but max is 5'
        }), 400

    print(f"\n🖨️ Processing queue for user [{user_id}]")
    print(f"📋 Found {len(jobs)} pending job(s)")

    # Step 5 — Collect all cards from all jobs
    all_cards      = []
    all_job_ids    = []
    template_count = len(jobs)

    for job in jobs:
        job_id = job.get('job_id')
        cards  = job.get('cards', [])
        all_job_ids.append(job_id)

        for card in cards:
            extracted = card.get('extracted_texts', {})
            edited    = card.get('edited_texts', {})
            extracted.update(edited)
            card['extracted_texts'] = extracted
            all_cards.append(card)

        print(f"  ✅ Job [{job_id}] — {len(cards)} card(s) collected")

    print(f"📦 Total cards to process: {len(all_cards)}")
    print(f"🖼️  Using template: {template_count}-card-template.pdf")

    # Step 6 — Mark all jobs as "processing"
    try:
        now = datetime.now(timezone.utc).isoformat()
        for job_id in all_job_ids:
            db.collection('print_queue').document(job_id).update({
                'status':     'processing',
                'updated_at': now,
            })
        print(f"✅ Jobs marked as processing")
    except Exception as e:
        print(f"⚠️ Failed to mark jobs as processing: {e}")

    # Step 7 — Generate PDF
    try:
        pdf_bytes = generate_final_pdf(all_cards, template_count)
        print(f"✅ PDF generated successfully")
    except Exception as e:
        now = datetime.now(timezone.utc).isoformat()
        for job_id in all_job_ids:
            db.collection('print_queue').document(job_id).update({
                'status':     'failed',
                'error':      str(e),
                'updated_at': now,
            })
        print(f"❌ PDF generation failed: {e}")
        return jsonify({'error': f'PDF generation failed: {str(e)}'}), 500

    # Step 8 — Mark all jobs as "completed"
    try:
        now = datetime.now(timezone.utc).isoformat()
        for job_id in all_job_ids:
            db.collection('print_queue').document(job_id).update({
                'status':     'completed',
                'updated_at': now,
                'error':      None,
            })
        print(f"✅ Jobs marked as completed")
    except Exception as e:
        print(f"⚠️ Failed to mark jobs as completed: {e}")

    # Step 9 — Return PDF
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype='application/pdf',
        as_attachment=True,
        download_name='fayda_id_cards.pdf'
    )
# ============================================================
# ENDPOINT 7 — Process PDF Template
# ============================================================

@fayda_bp.route('/process-pdf-template', methods=['POST'])
def process_pdf_template():

    # Step 1 — Verify token
    try:
        user_id = verify_token(request)
    except Exception as e:
        return jsonify({'error': str(e)}), 401

    # Step 2 — Validate uploaded PDFs
    pdf_files = []
    for i in range(1, 6):  # pdf_1 to pdf_5
        key = f'pdf_{i}'
        if key in request.files:
            pdf_files.append(request.files[key])

    if not pdf_files:
        return jsonify({'error': 'At least one PDF file is required (pdf_1 to pdf_5)'}), 400

    if len(pdf_files) > 5:
        return jsonify({'error': 'Maximum 5 PDF files allowed'}), 400

    # Step 3 — Validate file types
    for i, f in enumerate(pdf_files):
        if f.mimetype not in ('application/pdf', 'application/octet-stream'):
            return jsonify({'error': f'File {i+1} must be a PDF'}), 400

    print(f"\n📄 Processing {len(pdf_files)} PDF file(s) for user [{user_id}]")

    # Step 4 — Extract data from each PDF
    from services.gemini import extract_from_pdf

    all_cards      = []
    template_count = len(pdf_files)

    for i, pdf_file in enumerate(pdf_files):
        print(f"\n📄 Processing PDF {i+1}/{template_count}: {pdf_file.filename}")
        try:
            extracted_texts, profile_b64, qr_b64 = extract_from_pdf(pdf_file)

            card = {
                'extracted_texts': extracted_texts,
                'profile_image':   profile_b64,
                'qr_image':        qr_b64,
                'use_black_and_white': False,
                'use_white_bg':        False,
            }
            all_cards.append(card)
            print(f"  ✅ PDF {i+1} extracted successfully")

        except Exception as e:
            print(f"  ❌ PDF {i+1} extraction failed: {e}")
            return jsonify({
                'error': f'Failed to extract data from PDF {i+1}: {str(e)}'
            }), 500

    print(f"\n📦 Total cards extracted: {len(all_cards)}")
    print(f"🖼️  Using template: {template_count}-card-template.pdf")

    # Step 5 — Generate PDF
    try:
        pdf_bytes = generate_final_pdf(all_cards, template_count)
        print(f"✅ PDF generated successfully")
    except Exception as e:
        print(f"❌ PDF generation failed: {e}")
        return jsonify({'error': f'PDF generation failed: {str(e)}'}), 500

    # Step 6 — Return PDF
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype='application/pdf',
        as_attachment=True,
        download_name='fayda_id_cards.pdf'
    )

# ============================================================
# ENDPOINT 7 — Process Photo (BG Remove + Color)
# ============================================================

@fayda_bp.route('/process-photo', methods=['POST'])
def process_photo():

    # Step 1 — Verify token
    try:
        user_id = verify_token(request)
    except Exception as e:
        return jsonify({'error': str(e)}), 401

    # Step 2 — Parse body
    body = request.get_json()
    if not body:
        return jsonify({'error': 'Request body is required'}), 400

    # Step 3 — Validate
    profile_image_b64 = body.get('profile_image', '')
    remove_bg         = body.get('remove_bg', False)
    grayscale         = body.get('grayscale', False)

    if not profile_image_b64:
        return jsonify({'error': 'profile_image is required'}), 400

    print(f"\n🖼️  Processing photo for user [{user_id}]")
    print(f"   remove_bg: {remove_bg} | grayscale: {grayscale}")

    try:
        import base64
        from PIL import Image
        import io

        # ── Decode base64 to PIL ──
        img_data  = base64.b64decode(profile_image_b64)
        pil_image = Image.open(io.BytesIO(img_data)).convert('RGBA')

        print(f"📸 Original image size: {pil_image.width}x{pil_image.height}")

        # ── Step 4: Remove background if requested ──
        if remove_bg:
            print("🔄 Removing background...")
            try:
                from rembg import remove as rembg_remove, new_session
                # Force CPU mode
                session      = new_session(
                    model_name='u2net',
                    providers=['CPUExecutionProvider']
                )
                input_bytes  = io.BytesIO()
                pil_image.save(input_bytes, format='PNG')
                input_bytes  = input_bytes.getvalue()
                output_bytes = rembg_remove(
                    input_bytes,
                    session=session
                )
                pil_image    = Image.open(io.BytesIO(output_bytes)).convert('RGBA')
                print(f"✅ Background removed (CPU mode)")
            except Exception as e:
                print(f"❌ BG removal error: {e}")
                return jsonify({'error': f'Background removal failed: {str(e)}'}), 500

        # ── Step 5: Apply grayscale if requested ──
        if grayscale:
            print("🔄 Converting to grayscale...")
            if pil_image.mode == 'RGBA':
                # Keep alpha channel when converting to grayscale
                r, g, b, a = pil_image.split()
                gray        = Image.merge('RGB', (r, g, b)).convert('L')
                gray_rgba   = Image.merge('RGBA', (gray, gray, gray, a))
                pil_image   = gray_rgba
            else:
                pil_image = pil_image.convert('L').convert('RGBA')
            print(f"✅ Grayscale applied")

        # ── Step 6: Convert back to base64 ──
        output_buffer = io.BytesIO()
        pil_image.save(output_buffer, format='PNG')
        output_b64 = base64.b64encode(
            output_buffer.getvalue()
        ).decode('utf-8')

        print(f"✅ Photo processed — final size: {pil_image.width}x{pil_image.height}")

        return jsonify({
            'status':        'success',
            'profile_image': output_b64,
            'remove_bg':     remove_bg,
            'grayscale':     grayscale,
        }), 200

    except Exception as e:
        print(f"❌ process_photo error: {e}")
        return jsonify({'error': str(e)}), 500