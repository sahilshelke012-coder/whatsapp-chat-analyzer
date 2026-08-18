import re
from datetime import datetime

# Regex pattern matching standard WhatsApp chat timestamp variations:
# Pattern 1: Standard Android: 'DD/MM/YY, HH:MM - ' or 'MM/DD/YY, HH:MM AM/PM - '
PATTERN_ANDROID = r'^(\d{1,4}[/\.-]\d{1,2}[/\.-]\d{1,4},\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:[APap][Mm])?)\s*-\s*'
# Pattern 2: iPhone bracket format: '[DD/MM/YY, HH:MM:SS AM/PM] Name: Message'
PATTERN_IOS = r'^\[(\d{1,4}[/\.-]\d{1,2}[/\.-]\d{1,4},\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:[APap][Mm])?)\]\s*'

DATE_FORMATS = [
    '%d/%m/%y, %H:%M:%S',
    '%d/%m/%Y, %H:%M:%S',
    '%d/%m/%y, %H:%M',
    '%d/%m/%Y, %H:%M',
    '%m/%d/%y, %I:%M %p',
    '%m/%d/%Y, %I:%M %p',
    '%d/%m/%y, %I:%M %p',
    '%d/%m/%Y, %I:%M %p',
    '%Y-%m-%d, %H:%M:%S',
    '%Y-%m-%d, %H:%M',
]

SYSTEM_PATTERNS = [
    'messages and calls are end-to-end encrypted',
    'created group',
    'added',
    'removed',
    'left',
    'changed the group description',
    'changed the subject',
    'changed their phone number',
    'security code changed'
]

def is_system_message(text):
    text_lower = text.lower()
    return any(p in text_lower for p in SYSTEM_PATTERNS)

def parse_date(date_str):
    clean_str = date_str.replace('\u202f', ' ').replace('\xa0', ' ').strip()
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(clean_str, fmt)
        except ValueError:
            continue
    try:
        parts = re.split(r'[/,\s:-]+', clean_str)
        if len(parts) >= 5:
            val1 = int(parts[0])
            val2 = int(parts[1])
            year = int(parts[2])
            if year < 100:
                year += 2000
            hour = int(parts[3])
            minute = int(parts[4])
            if 'pm' in clean_str.lower() and hour < 12:
                hour += 12
            elif 'am' in clean_str.lower() and hour == 12:
                hour = 0
            
            # Simple heuristic for day/month ordering
            day = val1 if val1 <= 31 else val2
            month = val2 if val1 <= 31 else val1
            if month > 12:
                month, day = day, month
            return datetime(year, max(1, min(month, 12)), max(1, min(day, 31)), hour % 24, minute % 60)
    except Exception:
        pass
    return None

def parse_whatsapp_chat_content(content):
    """
    Parses WhatsApp chat text string into structured message records.
    """
    lines = content.splitlines()
    messages = []

    current_date = None
    current_author = None
    current_message_lines = []

    for line in lines:
        line_clean = line.strip('\ufeff')
        if not line_clean.strip():
            continue

        match_android = re.match(PATTERN_ANDROID, line_clean)
        match_ios = re.match(PATTERN_IOS, line_clean)
        match = match_android or match_ios

        if match:
            if current_author and current_message_lines:
                full_text = '\n'.join(current_message_lines).strip()
                if full_text:
                    messages.append({
                        'datetime': current_date,
                        'author': current_author,
                        'message': full_text
                    })
                current_message_lines = []

            date_str = match.group(1)
            remainder = line_clean[match.end():]

            if ':' in remainder:
                author, message = remainder.split(':', 1)
                current_author = author.strip()
                current_message_lines.append(message.strip())
            else:
                current_author = "System"
                current_message_lines.append(remainder.strip())

            current_date = parse_date(date_str)
        else:
            if current_author is not None:
                current_message_lines.append(line_clean.strip())

    if current_author and current_message_lines:
        full_text = '\n'.join(current_message_lines).strip()
        if full_text:
            messages.append({
                'datetime': current_date,
                'author': current_author,
                'message': full_text
            })

    return messages
