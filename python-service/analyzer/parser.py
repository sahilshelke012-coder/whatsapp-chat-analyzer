import re
from datetime import datetime

# Regex pattern matching standard WhatsApp chat timestamp variations:
# 12-hour: 12/31/23, 11:59 PM - Name: Message
# 24-hour: [31/12/23, 23:59:59] Name: Message (iOS format with brackets)
# Android 24-hour: 31/12/23, 23:59 - Name: Message

# Pattern 1: Standard Android 12-hour/24-hour: 'DD/MM/YY, HH:MM - ' or 'MM/DD/YY, HH:MM AM/PM - '
PATTERN_ANDROID = r'^(\d{1,4}[/\.-]\d{1,2}[/\.-]\d{1,4},\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:[APap][Mm])?)\s*-\s*'
# Pattern 2: iOS bracket format: '[DD/MM/YY, HH:MM:SS AM/PM] Name: Message'
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

def parse_date(date_str):
    clean_str = date_str.replace('\u202f', ' ').replace('\xa0', ' ').strip()
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(clean_str, fmt)
        except ValueError:
            continue
    # Fallback soft parse
    try:
        # Try extracting digits
        parts = re.split(r'[/,\s:-]+', clean_str)
        if len(parts) >= 5:
            day_or_month = int(parts[0])
            month_or_day = int(parts[1])
            year = int(parts[2])
            if year < 100:
                year += 2000
            hour = int(parts[3])
            minute = int(parts[4])
            if 'pm' in clean_str.lower() and hour < 12:
                hour += 12
            elif 'am' in clean_str.lower() and hour == 12:
                hour = 0
            return datetime(year, month_or_day, day_or_month, hour, minute)
    except Exception:
        pass
    return None

def parse_whatsapp_chat(file_path):
    """
    Parses a WhatsApp chat text file into a list of structured message dictionaries.
    Returns: List of dicts { 'datetime': datetime_obj, 'author': str, 'message': str }
    """
    messages = []
    
    with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
        lines = f.readlines()

    current_date = None
    current_author = None
    current_message_lines = []

    for line in lines:
        line_clean = line.strip('\ufeff')  # Remove UTF-8 BOM if present
        match_android = re.match(PATTERN_ANDROID, line_clean)
        match_ios = re.match(PATTERN_IOS, line_clean)

        match = match_android or match_ios
        if match:
            # If we have a previously accumulated message, store it
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

            # Split author and text (format: "Author: Message" or system notification "Message")
            if ':' in remainder:
                author, message = remainder.split(':', 1)
                current_author = author.strip()
                current_message_lines.append(message.strip())
            else:
                # System message (e.g. "Messages and calls are end-to-end encrypted")
                current_author = "System"
                current_message_lines.append(remainder.strip())

            current_date = parse_date(date_str)
        else:
            # Continuation of multi-line message
            if current_author is not None:
                current_message_lines.append(line_clean.strip())

    # Flush last message
    if current_author and current_message_lines:
        full_text = '\n'.join(current_message_lines).strip()
        if full_text:
            messages.append({
                'datetime': current_date,
                'author': current_author,
                'message': full_text
            })

    return messages
