import firebase_admin
from firebase_admin import credentials, auth, firestore

# ── Initialize Firebase Admin only once ──
if not firebase_admin._apps:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

# ── Firestore client ──
db = firestore.client()

# ============================================================
# AUTH
# ============================================================

def verify_token(request):
    """TEMPORARY: skip token check during development"""
    return "test@autopress.com"

# def verify_token(request):
#     """Verify Firebase ID token from request header"""
#     auth_header = request.headers.get('Authorization', '')
#     if not auth_header.startswith('Bearer '):
#         raise Exception('No token provided')
#     token = auth_header.replace('Bearer ', '')
#     try:
#         decoded = auth.verify_id_token(token)
#         return decoded['email']
#     except Exception as e:
#         raise Exception(f'Invalid token: {str(e)}')

# ============================================================
# USER
# ============================================================

def get_user(user_id):
    """Get user document from Firestore"""
    doc = db.collection('users').document(user_id).get()
    if doc.exists:
        return doc.to_dict()
    return None

def get_user_credits(user_id):
    """Get current credit balance for a user"""
    user = get_user(user_id)
    if user:
        return user.get('credits', 0)
    return 0

def deduct_credits(user_id, amount):
    """Deduct credits from user — returns (success, remaining_credits or error_msg)"""
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
# QUEUE
# ============================================================

def add_job_to_queue(job_data):
    """Add a new job to print_queue collection"""
    doc_ref            = db.collection('print_queue').document()
    job_data['job_id'] = doc_ref.id
    doc_ref.set(job_data)
    return doc_ref.id

def get_pending_jobs():
    """Get all pending jobs ordered by creation time"""
    jobs = db.collection('print_queue')\
             .where('status', '==', 'pending')\
             .order_by('created_at')\
             .stream()
    return [{'job_id': j.id, **j.to_dict()} for j in jobs]

def update_job_status(job_id, status, result=None):
    """Update job status — optionally attach result data"""
    update_data = {'status': status}
    if result:
        update_data['result'] = result
    db.collection('print_queue').document(job_id).update(update_data)