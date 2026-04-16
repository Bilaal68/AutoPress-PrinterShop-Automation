import fitz  # PyMuPDF
import base64
import io
import os
import barcode
from barcode.writer import ImageWriter
from PIL import Image, ImageDraw, ImageFont

# ============================================================
# FONT PATHS
# ============================================================
FONTS_DIR         = os.path.join(os.path.dirname(__file__), '..', 'fonts')
AMHARIC_FONT_PATH = os.path.join(FONTS_DIR, 'VisualGeezUnicode.ttf')
ENGLISH_FONT_PATH = os.path.join(FONTS_DIR, 'Roboto-SemiBold.ttf')
BOLD_FONT_PATH    = os.path.join(FONTS_DIR, 'Roboto-Bold.ttf')

# ============================================================
# TEMPLATE PATHS
# ============================================================
TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), '..', 'templates')

TEMPLATE_PATHS = {
    1: os.path.join(TEMPLATES_DIR, '1-card-template.pdf'),
    2: os.path.join(TEMPLATES_DIR, '2-card-template.pdf'),
    3: os.path.join(TEMPLATES_DIR, '3-card-template.pdf'),
    4: os.path.join(TEMPLATES_DIR, '4-card-template.pdf'),
    5: os.path.join(TEMPLATES_DIR, '5-card-template.pdf'),
}

# ============================================================
# AMHARIC FIELD KEYS
# ============================================================
AMHARIC_FIELDS = {
    'fullNameAmharic',
    'dobEthiopian',
    'genderAmharic',
    'nationalityAmharic',
    'regionAmharic',
    'subcityAmharic',
    'woredaAmharic',
    'issueDateEthiopian',
    'expiryDateEthiopian',
}

# ============================================================
# CARD FIELD MAPPINGS
# ============================================================
CARD1_FIELDS = [
    {"key": "fullNameAmharic",    "x": 533,  "y": 260, "width": 488, "height": 66, "fontSize": 7, "rotation": 0},
    {"key": "fullNameEnglish",    "x": 535,  "y": 300, "width": 489, "height": 66, "fontSize": 7, "rotation": 0},
    {"key": "dobGregorian",       "x": 711,  "y": 395, "width": 149, "height": 38, "fontSize": 6, "rotation": 0},
    {"key": "dobEthiopian",       "x": 533,  "y": 395, "width": 149, "height": 42, "fontSize": 6, "rotation": 0},
    {"key": "genderAmharic",      "x": 533,  "y": 460, "width": 63,  "height": 38, "fontSize": 7, "rotation": 0},
    {"key": "genderEnglish",      "x": 613,  "y": 460, "width": 98,  "height": 38, "fontSize": 7, "rotation": 0},
    {"key": "phoneNumber",        "x": 1376, "y": 175, "width": 201, "height": 26, "fontSize": 6, "rotation": 0},
    {"key": "nationalityAmharic", "x": 1374, "y": 256, "width": 113, "height": 36, "fontSize": 7, "rotation": 0},
    {"key": "nationalityEnglish", "x": 1538, "y": 258, "width": 125, "height": 36, "fontSize": 7, "rotation": 0},
    {"key": "regionAmharic",      "x": 1373, "y": 322, "width": 158, "height": 39, "fontSize": 7, "rotation": 0},
    {"key": "regionEnglish",      "x": 1371, "y": 368, "width": 160, "height": 30, "fontSize": 7, "rotation": 0},
    {"key": "subcityAmharic",     "x": 1370, "y": 401, "width": 374, "height": 39, "fontSize": 7, "rotation": 0},
    {"key": "subcityEnglish",     "x": 1371, "y": 445, "width": 372, "height": 39, "fontSize": 7, "rotation": 0},
    {"key": "woredaAmharic",      "x": 1371, "y": 505, "width": 132, "height": 40, "fontSize": 7, "rotation": 0, "wrap": True},
    {"key": "woredaEnglish",      "x": 1371, "y": 530, "width": 129, "height": 40, "fontSize": 7, "rotation": 0, "wrap": True},
    {"key": "issueDateGregorian", "x": 140,  "y": 120, "width": 28,  "height": 200, "fontSize": 6, "rotation": 270},
    {"key": "issueDateEthiopian", "x": 140,  "y": 420, "width": 25,  "height": 180, "fontSize": 6, "rotation": 270},
    {"key": "expiryDateGregorian","x": 710,  "y": 540, "width": 168, "height": 48, "fontSize": 6, "rotation": 0},
    {"key": "expiryDateEthiopian","x": 533,  "y": 540, "width": 158, "height": 45, "fontSize": 6, "rotation": 0},
    {"key": "FIN",                "x": 1470, "y": 605, "width": 201, "height": 46, "fontSize": 6, "rotation": 0},
    {"key": "serialNumber",       "x": 2234, "y": 662, "width": 120, "height": 24, "fontSize": 4, "rotation": 0},
    {"key": "profilePhoto",       "x": 183,  "y": 230, "width": 340, "height": 446, "type": "image", "rotation": 0},
    {"key": "smallProfile",       "x": 952,  "y": 549, "width": 122, "height": 141, "type": "image", "rotation": 0},
    {"key": "qrCode",             "x": 1720, "y": 80,  "width": 640, "height": 570, "type": "image", "rotation": 0},
    {"key": "FAN",                "x": 588,  "y": 594, "width": 294, "height": 97,  "type": "barcode", "rotation": 0},
]

CARD2_FIELDS = [
    {"key": "fullNameAmharic",    "x": 534,  "y": 930,  "width": 254, "height": 43, "fontSize": 7, "rotation": 0},
    {"key": "fullNameEnglish",    "x": 534,  "y": 980,  "width": 252, "height": 45, "fontSize": 7, "rotation": 0},
    {"key": "dobEthiopian",       "x": 532,  "y": 1069, "width": 156, "height": 36, "fontSize": 6, "rotation": 0},
    {"key": "dobGregorian",       "x": 705,  "y": 1069, "width": 176, "height": 38, "fontSize": 6, "rotation": 0},
    {"key": "genderAmharic",      "x": 532,  "y": 1139, "width": 66,  "height": 38, "fontSize": 7, "rotation": 0},
    {"key": "genderEnglish",      "x": 610,  "y": 1139, "width": 86,  "height": 38, "fontSize": 7, "rotation": 0},
    {"key": "phoneNumber",        "x": 1374, "y": 849,  "width": 214, "height": 38, "fontSize": 6, "rotation": 0},
    {"key": "nationalityAmharic", "x": 1374, "y": 939,  "width": 114, "height": 36, "fontSize": 7, "rotation": 0},
    {"key": "nationalityEnglish", "x": 1540, "y": 939,  "width": 128, "height": 38, "fontSize": 7, "rotation": 0},
    {"key": "regionAmharic",      "x": 1370, "y": 996,  "width": 175, "height": 41, "fontSize": 7, "rotation": 0},
    {"key": "regionEnglish",      "x": 1370, "y": 1041, "width": 175, "height": 45, "fontSize": 7, "rotation": 0},
    {"key": "subcityAmharic",     "x": 1370, "y": 1089, "width": 372, "height": 38, "fontSize": 7, "rotation": 0},
    {"key": "subcityEnglish",     "x": 1370, "y": 1129, "width": 372, "height": 45, "fontSize": 7, "rotation": 0},
    {"key": "woredaAmharic",      "x": 1372, "y": 1199, "width": 161, "height": 38, "fontSize": 7, "rotation": 0, "wrap": True},
    {"key": "woredaEnglish",      "x": 1374, "y": 1224, "width": 159, "height": 29, "fontSize": 7, "rotation": 0, "wrap": True},
    {"key": "issueDateGregorian", "x": 135,  "y": 850,  "width": 35,  "height": 143, "fontSize": 6, "rotation": 270},
    {"key": "issueDateEthiopian", "x": 135,  "y": 1140, "width": 35,  "height": 143, "fontSize": 6, "rotation": 270},
    {"key": "expiryDateGregorian","x": 701,  "y": 1209, "width": 168, "height": 31, "fontSize": 6, "rotation": 0},
    {"key": "expiryDateEthiopian","x": 525,  "y": 1209, "width": 156, "height": 38, "fontSize": 6, "rotation": 0},
    {"key": "FIN",                "x": 1470, "y": 1277, "width": 196, "height": 43, "fontSize": 6, "rotation": 0},
    {"key": "serialNumber",       "x": 2238, "y": 1335, "width": 100, "height": 31, "fontSize": 4, "rotation": 0},
    {"key": "profilePhoto",       "x": 180,  "y": 877,  "width": 343, "height": 477, "type": "image", "rotation": 0},
    {"key": "smallProfile",       "x": 947,  "y": 1217, "width": 134, "height": 152, "type": "image", "rotation": 0},
    {"key": "qrCode",             "x": 1720, "y": 750,  "width": 640, "height": 570, "type": "image", "rotation": 0},
    {"key": "FAN",                "x": 593,  "y": 1272, "width": 284, "height": 89,  "type": "barcode", "rotation": 0},
]

CARD3_FIELDS = [
    {"key": "fullNameAmharic",    "x": 537,  "y": 1617, "width": 304, "height": 40,  "fontSize": 7, "rotation": 0},
    {"key": "fullNameEnglish",    "x": 535,  "y": 1659, "width": 306, "height": 48,  "fontSize": 7, "rotation": 0},
    {"key": "dobGregorian",       "x": 701,  "y": 1750, "width": 219, "height": 38,  "fontSize": 6, "rotation": 0},
    {"key": "dobEthiopian",       "x": 533,  "y": 1750, "width": 162, "height": 33,  "fontSize": 6, "rotation": 0},
    {"key": "genderAmharic",      "x": 530,  "y": 1821, "width": 78,  "height": 40,  "fontSize": 7, "rotation": 0},
    {"key": "genderEnglish",      "x": 620,  "y": 1823, "width": 100, "height": 38,  "fontSize": 7, "rotation": 0},
    {"key": "phoneNumber",        "x": 1370, "y": 1535, "width": 214, "height": 40,  "fontSize": 6, "rotation": 0},
    {"key": "nationalityAmharic", "x": 1374, "y": 1600, "width": 109, "height": 38,  "fontSize": 7, "rotation": 0},
    {"key": "nationalityEnglish", "x": 1557, "y": 1600, "width": 126, "height": 35,  "fontSize": 7, "rotation": 0},
    {"key": "regionAmharic",      "x": 1376, "y": 1671, "width": 154, "height": 36,  "fontSize": 7, "rotation": 0},
    {"key": "regionEnglish",      "x": 1374, "y": 1706, "width": 156, "height": 43,  "fontSize": 7, "rotation": 0},
    {"key": "subcityAmharic",     "x": 1372, "y": 1749, "width": 372, "height": 43,  "fontSize": 7, "rotation": 0},
    {"key": "subcityEnglish",     "x": 1374, "y": 1794, "width": 368, "height": 43,  "fontSize": 7, "rotation": 0},
    {"key": "woredaAmharic",      "x": 1370, "y": 1849, "width": 143, "height": 43,  "fontSize": 7, "rotation": 0, "wrap": True},
    {"key": "woredaEnglish",      "x": 1372, "y": 1874, "width": 140, "height": 45,  "fontSize": 7, "rotation": 0, "wrap": True},
    {"key": "issueDateGregorian", "x": 135,  "y": 1500, "width": 31,  "height": 169, "fontSize": 6, "rotation": 270},
    {"key": "issueDateEthiopian", "x": 135,  "y": 1850, "width": 29,  "height": 112, "fontSize": 6, "rotation": 270},
    {"key": "expiryDateGregorian","x": 703,  "y": 1891, "width": 160, "height": 45,  "fontSize": 6, "rotation": 0},
    {"key": "expiryDateEthiopian","x": 530,  "y": 1891, "width": 150, "height": 44,  "fontSize": 6, "rotation": 0},
    {"key": "FIN",                "x": 1477, "y": 1955, "width": 191, "height": 39,  "fontSize": 6, "rotation": 0},
    {"key": "serialNumber",       "x": 2236, "y": 2020, "width": 110, "height": 32,  "fontSize": 4, "rotation": 0},
    {"key": "profilePhoto",       "x": 185,  "y": 1552, "width": 336, "height": 474, "type": "image",   "rotation": 0},
    {"key": "smallProfile",       "x": 950,  "y": 1905, "width": 129, "height": 139, "type": "image",   "rotation": 0},
    {"key": "qrCode",             "x": 1720, "y": 1428, "width": 640, "height": 570, "type": "image",   "rotation": 0},
    {"key": "FAN",                "x": 591,  "y": 1945, "width": 289, "height": 94,  "type": "barcode", "rotation": 0},
]

CARD4_FIELDS = [
    {"key": "fullNameAmharic",    "x": 536,  "y": 2293, "width": 288, "height": 47,  "fontSize": 7, "rotation": 0},
    {"key": "fullNameEnglish",    "x": 538,  "y": 2340, "width": 288, "height": 47,  "fontSize": 7, "rotation": 0},
    {"key": "dobEthiopian",       "x": 540,  "y": 2421, "width": 139, "height": 42,  "fontSize": 6, "rotation": 0},
    {"key": "dobGregorian",       "x": 708,  "y": 2421, "width": 132, "height": 40,  "fontSize": 6, "rotation": 0},
    {"key": "genderAmharic",      "x": 534,  "y": 2494, "width": 75,  "height": 36,  "fontSize": 7, "rotation": 0},
    {"key": "genderEnglish",      "x": 633,  "y": 2496, "width": 82,  "height": 35,  "fontSize": 7, "rotation": 0},
    {"key": "phoneNumber",        "x": 1376, "y": 2213, "width": 182, "height": 29,  "fontSize": 6, "rotation": 0},
    {"key": "nationalityAmharic", "x": 1374, "y": 2283, "width": 108, "height": 36,  "fontSize": 7, "rotation": 0},
    {"key": "nationalityEnglish", "x": 1544, "y": 2283, "width": 120, "height": 36,  "fontSize": 7, "rotation": 0},
    {"key": "regionAmharic",      "x": 1376, "y": 2351, "width": 160, "height": 36,  "fontSize": 7, "rotation": 0},
    {"key": "regionEnglish",      "x": 1377, "y": 2392, "width": 160, "height": 45,  "fontSize": 7, "rotation": 0},
    {"key": "subcityAmharic",     "x": 1377, "y": 2441, "width": 363, "height": 47,  "fontSize": 7, "rotation": 0},
    {"key": "subcityEnglish",     "x": 1377, "y": 2495, "width": 364, "height": 47,  "fontSize": 7, "rotation": 0},
    {"key": "woredaAmharic",      "x": 1379, "y": 2553, "width": 163, "height": 40,  "fontSize": 7, "rotation": 0, "wrap": True},
    {"key": "woredaEnglish",      "x": 1381, "y": 2578, "width": 165, "height": 31,  "fontSize": 7, "rotation": 0, "wrap": True},
    {"key": "issueDateGregorian", "x": 130,  "y": 2200, "width": 49,  "height": 156, "fontSize": 6, "rotation": 270},
    {"key": "issueDateEthiopian", "x": 130,  "y": 2500, "width": 47,  "height": 142, "fontSize": 6, "rotation": 270},
    {"key": "expiryDateGregorian","x": 715,  "y": 2566, "width": 147, "height": 40,  "fontSize": 6, "rotation": 0},
    {"key": "expiryDateEthiopian","x": 540,  "y": 2565, "width": 149, "height": 42,  "fontSize": 6, "rotation": 0},
    {"key": "FIN",                "x": 1474, "y": 2630, "width": 196, "height": 40,  "fontSize": 6, "rotation": 0},
    {"key": "serialNumber",       "x": 2233, "y": 2689, "width": 125, "height": 23,  "fontSize": 4, "rotation": 0},
    {"key": "profilePhoto",       "x": 178,  "y": 2283, "width": 350, "height": 446, "type": "image",   "rotation": 0},
    {"key": "smallProfile",       "x": 945,  "y": 2580, "width": 135, "height": 139, "type": "image",   "rotation": 0},
    {"key": "qrCode",             "x": 1720, "y": 2103, "width": 640, "height": 570, "type": "image",   "rotation": 0},
    {"key": "FAN",                "x": 586,  "y": 2623, "width": 298, "height": 99,  "type": "barcode", "rotation": 0},
]

CARD5_FIELDS = [
    {"key": "fullNameAmharic",    "x": 539,  "y": 2959, "width": 278, "height": 42,  "fontSize": 7, "rotation": 0},
    {"key": "fullNameEnglish",    "x": 542,  "y": 3005, "width": 276, "height": 49,  "fontSize": 7, "rotation": 0},
    {"key": "dobGregorian",       "x": 704,  "y": 3098, "width": 183, "height": 37,  "fontSize": 6, "rotation": 0},
    {"key": "dobEthiopian",       "x": 523,  "y": 3098, "width": 166, "height": 37,  "fontSize": 6, "rotation": 0},
    {"key": "genderAmharic",      "x": 529,  "y": 3163, "width": 63,  "height": 35,  "fontSize": 7, "rotation": 0},
    {"key": "genderEnglish",      "x": 618,  "y": 3163, "width": 94,  "height": 32,  "fontSize": 7, "rotation": 0},
    {"key": "phoneNumber",        "x": 1371, "y": 2877, "width": 216, "height": 33,  "fontSize": 6, "rotation": 0},
    {"key": "nationalityAmharic", "x": 1374, "y": 2960, "width": 115, "height": 32,  "fontSize": 7, "rotation": 0},
    {"key": "nationalityEnglish", "x": 1545, "y": 2959, "width": 124, "height": 33,  "fontSize": 7, "rotation": 0},
    {"key": "regionAmharic",      "x": 1375, "y": 3021, "width": 151, "height": 49,  "fontSize": 7, "rotation": 0},
    {"key": "regionEnglish",      "x": 1374, "y": 3069, "width": 154, "height": 42,  "fontSize": 7, "rotation": 0},
    {"key": "subcityAmharic",     "x": 1377, "y": 3116, "width": 364, "height": 42,  "fontSize": 7, "rotation": 0},
    {"key": "subcityEnglish",     "x": 1378, "y": 3167, "width": 361, "height": 42,  "fontSize": 7, "rotation": 0},
    {"key": "woredaAmharic",      "x": 1381, "y": 3226, "width": 166, "height": 36,  "fontSize": 7, "rotation": 0, "wrap": True},
    {"key": "woredaEnglish",      "x": 1380, "y": 3251, "width": 167, "height": 35,  "fontSize": 7, "rotation": 0, "wrap": True},
    {"key": "issueDateGregorian", "x": 135,  "y": 2850, "width": 32,  "height": 164, "fontSize": 6, "rotation": 270},
    {"key": "issueDateEthiopian", "x": 135,  "y": 3170, "width": 26,  "height": 141, "fontSize": 6, "rotation": 270},
    {"key": "expiryDateGregorian","x": 714,  "y": 3239, "width": 147, "height": 46,  "fontSize": 6, "rotation": 0},
    {"key": "expiryDateEthiopian","x": 544,  "y": 3239, "width": 144, "height": 44,  "fontSize": 6, "rotation": 0},
    {"key": "FIN",                "x": 1477, "y": 3305, "width": 192, "height": 42,  "fontSize": 6, "rotation": 0},
    {"key": "serialNumber",       "x": 2233, "y": 3362, "width": 117, "height": 30,  "fontSize": 4, "rotation": 0},
    {"key": "profilePhoto",       "x": 167,  "y": 2947, "width": 361, "height": 432, "type": "image",   "rotation": 0},
    {"key": "smallProfile",       "x": 947,  "y": 3251, "width": 127, "height": 144, "type": "image",   "rotation": 0},
    {"key": "qrCode",             "x": 1720, "y": 2780, "width": 640, "height": 570, "type": "image",   "rotation": 0},
    {"key": "FAN",                "x": 593,  "y": 3297, "width": 287, "height": 94,  "type": "barcode", "rotation": 0},
]

CARD_FIELDS_MAP = {
    1: CARD1_FIELDS,
    2: CARD2_FIELDS,
    3: CARD3_FIELDS,
    4: CARD4_FIELDS,
    5: CARD5_FIELDS,
}

# ============================================================
# DATA KEY MAPPING
# ============================================================
DATA_KEY_MAP = {
    "fullNameAmharic":     "amharic_name",
    "fullNameEnglish":     "english_name",
    "dobGregorian":        "english_birth",
    "dobEthiopian":        "amharic_birth",
    "genderAmharic":       "amharic_sex",
    "genderEnglish":       "english_sex",
    "phoneNumber":         "phone",
    "nationalityAmharic":  "ኢትዮጵያዊ",
    "nationalityEnglish":  "Ethiopian",
    "regionAmharic":       "amharic_region",
    "regionEnglish":       "english_region",
    "subcityAmharic":      "amharic_zone",
    "subcityEnglish":      "english_zone",
    "woredaAmharic":       "amharic_woreda",
    "woredaEnglish":       "english_woreda",
    "FIN":                 "fin",
    "serialNumber":        "fin",
    "issueDateEthiopian":  "issueDateEthiopian",
    "issueDateGregorian":  "issueDateGregorian",
    "expiryDateEthiopian": "expiryDateEthiopian",
    "expiryDateGregorian": "expiryDateGregorian",
}

# ============================================================
# TEMPLATE DIMENSIONS (pixels at 300 DPI)
# ============================================================
TEMPLATE_WIDTH  = 2480
TEMPLATE_HEIGHT = 3508

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def base64_to_pil(b64_string):
    img_data = base64.b64decode(b64_string)
    return Image.open(io.BytesIO(img_data))

def pil_to_bytes(pil_image, format='PNG'):
    buffer = io.BytesIO()
    pil_image.save(buffer, format=format)
    return buffer.getvalue()

def generate_barcode(fan_number):
    try:
        code128     = barcode.get_barcode_class('code128')
        barcode_obj = code128(str(fan_number), writer=ImageWriter())
        buffer      = io.BytesIO()
        barcode_obj.write(buffer, options={
            'write_text':    False,
            'module_height': 25,
            'quiet_zone':    2,
            'module_width':  0.8,
        })
        buffer.seek(0)

        barcode_img  = Image.open(buffer).convert('RGB')
        bar_w, bar_h = barcode_img.size

        print(f"📊 Barcode image size: {bar_w} x {bar_h} px")

        # ── Space between every digit ──
        fan_str = str(fan_number)
        spaced  = '   '.join(list(fan_str))

        # ── Text area on top ──
        text_height = 55
        new_img     = Image.new('RGB', (bar_w, bar_h + text_height), (255, 255, 255))
        new_img.paste(barcode_img, (0, text_height))
        draw        = ImageDraw.Draw(new_img)

        # ── Pick font: Bold > SemiBold > default ──
        USE_FONT_PATH = BOLD_FONT_PATH if os.path.exists(BOLD_FONT_PATH) else ENGLISH_FONT_PATH
        print(f"🔤 Font: {'Roboto-Bold' if os.path.exists(BOLD_FONT_PATH) else 'Roboto-SemiBold'}")

        # ── Find biggest font size that fits ──
        best_font      = None
        best_font_size = 30

        for font_size in range(55, 10, -1):
            try:
                test_font = ImageFont.truetype(USE_FONT_PATH, size=font_size)
                bbox      = draw.textbbox((0, 0), spaced, font=test_font)
                text_w    = bbox[2] - bbox[0]
                text_h    = bbox[3] - bbox[1]
                if text_w <= bar_w - 20 and text_h <= text_height - 10:
                    best_font      = test_font
                    best_font_size = font_size
                    break
            except Exception:
                continue

        # ── Fallback ──
        if best_font is None:
            try:
                best_font = ImageFont.truetype(USE_FONT_PATH, size=14)
            except Exception:
                best_font = ImageFont.load_default()

        print(f"🔤 Font size: {best_font_size}px | Text: '{spaced}'")

        # ── Center text ──
        bbox   = draw.textbbox((0, 0), spaced, font=best_font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        text_x = (bar_w - text_w) // 2
        text_y = (text_height - text_h) // 2

        # ── Draw BOLD by layering with offsets ──
        for ox, oy in [(0,0),(1,0),(0,1),(1,1),(2,0),(0,2),(2,1),(1,2),(2,2)]:
            draw.text(
                (text_x + ox, text_y + oy),
                spaced,
                fill=(0, 0, 0),
                font=best_font
            )

        final_buffer = io.BytesIO()
        new_img.save(final_buffer, format='PNG')
        final_buffer.seek(0)

        print(f"✅ Barcode done — {new_img.width}x{new_img.height}px | font: {best_font_size}px")
        return final_buffer.getvalue()

    except Exception as e:
        print(f"❌ Barcode generation error: {e}")
        return None

def scale_coords(x, y, width, height, page_width, page_height):
    scale_x  = page_width  / TEMPLATE_WIDTH
    scale_y  = page_height / TEMPLATE_HEIGHT
    scaled_x = x      * scale_x
    scaled_y = y      * scale_y
    scaled_w = width  * scale_x
    scaled_h = height * scale_y
    return scaled_x, scaled_y, scaled_w, scaled_h

def get_font(page, is_amharic, amharic_registered, english_registered):
    if is_amharic:
        return "Amharic" if amharic_registered else "helv"
    else:
        return "English" if english_registered else "helv"

# ============================================================
# TEXT WRAPPING FUNCTION (NEW)
# ============================================================

def split_text_into_lines(text, max_width, page, point, fontname, fontsize):
    """
    Split text into multiple lines that fit within max_width.
    Returns list of lines.
    """
    if not text:
        return []
    
    words = text.split(' ')
    lines = []
    current_line = []
    
    for word in words:
        # Test if word fits on current line
        test_line = ' '.join(current_line + [word])
        text_rect = page.insert_text(
            point,
            test_line,
            fontsize=fontsize,
            fontname=fontname,
            render_mode=fitz.TEXT_RENDER_MODE_INVISIBLE  # Invisible mode just to measure
        )
        
        # Get text width (approximate using character count for simplicity)
        # Since PyMuPDF doesn't easily return text width, we use character count approximation
        # For more accuracy, we can use the font metrics
        approx_width = len(test_line) * (fontsize * 0.6)  # Rough approximation
        
        if approx_width <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]
    
    if current_line:
        lines.append(' '.join(current_line))
    
    return lines


def insert_wrapped_text(page, text, rect, fontname, fontsize, color=(0, 0, 0)):
    """
    Insert text with automatic wrapping into a rectangle.
    """
    if not text:
        return
    
    max_width = rect.width
    line_height = fontsize * 1.2  # Line spacing
    
    # Split text into lines
    words = text.split(' ')
    lines = []
    current_line = []
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        # Approximate text width
        approx_width = len(test_line) * (fontsize * 0.6)
        
        if approx_width <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]
    
    if current_line:
        lines.append(' '.join(current_line))
    
    # Insert each line
    current_y = rect.y0 + fontsize
    for line in lines:
        if current_y + line_height <= rect.y1:
            point = fitz.Point(rect.x0, current_y)
            page.insert_text(
                point,
                line,
                fontsize=fontsize,
                fontname=fontname,
                color=color,
            )
            current_y += line_height
        else:
            # If doesn't fit, add ellipsis
            point = fitz.Point(rect.x0, current_y)
            page.insert_text(
                point,
                line[:int(len(line) * 0.8)] + "...",
                fontsize=fontsize,
                fontname=fontname,
                color=color,
            )
            break

# ============================================================
# MAIN PDF GENERATOR
# ============================================================

def generate_final_pdf(cards_data, template_count):

    template_path = TEMPLATE_PATHS[template_count]
    if not os.path.exists(template_path):
        raise Exception(f"Template not found: {template_path}")

    doc  = fitz.open(template_path)
    page = doc[0]

    page_width  = page.rect.width
    page_height = page.rect.height

    print(f"📄 Page size: {page_width} x {page_height} points")
    print(f"📐 Template assumed: {TEMPLATE_WIDTH} x {TEMPLATE_HEIGHT} pixels")
    print(f"📏 Scale X: {page_width/TEMPLATE_WIDTH:.4f} | Scale Y: {page_height/TEMPLATE_HEIGHT:.4f}")

    # ── Register fonts ──
    amharic_font_registered = False
    english_font_registered = False

    try:
        page.insert_font(fontname="Amharic", fontfile=AMHARIC_FONT_PATH)
        amharic_font_registered = True
        print("✅ Amharic font registered")
    except Exception as e:
        print(f"⚠️ Amharic font error: {e}")

    try:
        page.insert_font(fontname="English", fontfile=ENGLISH_FONT_PATH)
        english_font_registered = True
        print("✅ English font registered")
    except Exception as e:
        print(f"⚠️ English font error: {e}")

    # ── Process each card ──
    for card_index, card_data in enumerate(cards_data):
        card_number = card_index + 1
        fields      = CARD_FIELDS_MAP.get(card_number, [])

        extracted_texts = card_data.get('extracted_texts', {})
        profile_b64     = card_data.get('profile_image', '')
        qr_b64          = card_data.get('qr_image', '')
        use_bw          = card_data.get('use_black_and_white', False)
        fan_number      = extracted_texts.get('fan', '')

        print(f"\n🃏 Processing card {card_number}...")
        print(f"📋 Keys: {list(extracted_texts.keys())}")

        for field in fields:
            key        = field['key']
            field_type = field.get('type', 'text')
            x          = field['x']
            y          = field['y']
            w          = field['width']
            h          = field['height']
            rotation   = field.get('rotation', 0)
            should_wrap = field.get('wrap', False)  # NEW: check if field should wrap

            sx, sy, sw, sh = scale_coords(
                x, y, w, h,
                page_width, page_height
            )

            # ── TEXT ──
            if field_type == 'text' or 'type' not in field:

                if key in DATA_KEY_MAP:
                    mapped_key = DATA_KEY_MAP[key]
                    if mapped_key in ("ኢትዮጵያዊ", "Ethiopian"):
                        text_value = mapped_key
                    else:
                        text_value = extracted_texts.get(mapped_key, '')
                else:
                    text_value = ''

                print(f"  🔤 [{key}] → '{text_value}'")

                if not text_value:
                    continue

                font_size  = field.get('fontSize', 6)
                is_amharic = key in AMHARIC_FIELDS
                font_name  = get_font(
                    page, is_amharic,
                    amharic_font_registered,
                    english_font_registered
                )

                try:
                    if rotation == 270:
                        point  = fitz.Point(sx + sw/2, sy + sh)
                        result = page.insert_text(
                            point,
                            text_value,
                            fontsize=font_size,
                            fontname=font_name,
                            color=(0, 0, 0),
                            rotate=90,
                        )
                        print(f"  ✅ [{key}]: '{text_value}' result={result}")
                    else:
                        # ── NEW: Use wrapped text for fields that need it ──
                        if should_wrap:
                            rect = fitz.Rect(sx, sy, sx + sw, sy + sh)
                            insert_wrapped_text(
                                page, text_value, rect, font_name, font_size, (0, 0, 0)
                            )
                            print(f"  ✅ [{key}]: wrapped text inserted")
                        else:
                            point  = fitz.Point(sx, sy + font_size)
                            result = page.insert_text(
                                point,
                                text_value,
                                fontsize=font_size,
                                fontname=font_name,
                                color=(0, 0, 0),
                            )
                            print(f"  ✅ [{key}]: '{text_value}' result={result}")
                except Exception as e:
                    print(f"  ❌ Text error [{key}]: {e}")

            # ── IMAGE ──
            elif field_type == 'image':
                rect = fitz.Rect(sx, sy, sx + sw, sy + sh)
                try:
                    if key in ('profilePhoto', 'smallProfile'):
                        if not profile_b64:
                            continue
                        img = base64_to_pil(profile_b64)
                        if use_bw:
                            img = img.convert('L').convert('RGB')
                        page.insert_image(rect, stream=pil_to_bytes(img))
                        print(f"  ✅ Profile image [{key}]")

                    elif key == 'qrCode':
                        if not qr_b64:
                            continue
                        img = base64_to_pil(qr_b64)
                        page.insert_image(rect, stream=pil_to_bytes(img))
                        print(f"  ✅ QR image [{key}]")

                except Exception as e:
                    print(f"  ❌ Image error [{key}]: {e}")

            # ── BARCODE ──
            elif field_type == 'barcode':
                rect = fitz.Rect(sx, sy, sx + sw, sy + sh)
                try:
                    if not fan_number:
                        continue
                    barcode_bytes = generate_barcode(fan_number)
                    if barcode_bytes:
                        page.insert_image(rect, stream=barcode_bytes)
                        print(f"  ✅ Barcode [{key}]")
                except Exception as e:
                    print(f"  ❌ Barcode error [{key}]: {e}")

        print(f"✅ Card {card_number} done")

    output_buffer = io.BytesIO()
    doc.save(output_buffer)
    doc.close()
    output_buffer.seek(0)

    print("\n✅ PDF generated successfully")
    return output_buffer.getvalue()