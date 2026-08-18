from collections import Counter
import re
from utils import STOP_WORDS, extract_urls, extract_emojis

MEDIA_OMITTED_PATTERNS = [
    '<media omitted>',
    'media omitted',
    '<image omitted>',
    '<video omitted>',
    '<audio omitted>',
    '<sticker omitted>',
    '<document omitted>'
]

def is_media_message(message_str):
    msg_lower = message_str.lower().strip()
    return any(pattern in msg_lower for pattern in MEDIA_OMITTED_PATTERNS)

def calculate_stats(messages):
    user_messages = [m for m in messages if m['author'] != 'System']

    if not user_messages:
        return {
            'overall': {
                'totalMessages': 0,
                'totalWords': 0,
                'totalMedia': 0,
                'totalLinks': 0,
                'participantCount': 0,
                'mostActiveParticipant': 'N/A',
                'avgMessagesPerDay': 0
            },
            'userAnalysis': [],
            'timeAnalysis': {'byDate': [], 'byMonth': [], 'byDayOfWeek': [], 'byHour': []},
            'contentAnalysis': {'topWords': [], 'topEmojis': [], 'sharedLinks': [], 'mediaStats': {'totalMedia': 0, 'mediaByParticipant': {}}}
        }

    total_messages = len(user_messages)
    total_words = 0
    total_media = 0
    total_links = 0

    participant_counts = Counter()
    participant_words = Counter()
    participant_media = Counter()

    date_counts = Counter()
    month_counts = Counter()
    day_of_week_counts = Counter()
    hour_counts = Counter()

    all_words = []
    all_emojis = []
    shared_links = []

    days_map = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    for m in user_messages:
        author = m['author']
        msg_text = m['message']
        dt = m['datetime']

        participant_counts[author] += 1

        if is_media_message(msg_text):
            total_media += 1
            participant_media[author] += 1
        else:
            words = [w.lower().strip('.,!?"\'():;') for w in msg_text.split() if w.strip()]
            word_count = len(words)
            total_words += word_count
            participant_words[author] += word_count

            for w in words:
                clean_w = re.sub(r'[^a-zA-Z0-9\u0900-\u097F]', '', w)
                if len(clean_w) > 2 and clean_w.lower() not in STOP_WORDS and not clean_w.isdigit():
                    all_words.append(clean_w.lower())

        urls = extract_urls(msg_text)
        if urls:
            total_links += len(urls)
            for u in urls:
                shared_links.append({
                    'url': u,
                    'sharedBy': author,
                    'date': dt.strftime('%Y-%m-%d %H:%M') if dt else 'Unknown'
                })

        emojis = extract_emojis(msg_text)
        if emojis:
            all_emojis.extend(emojis)

        if dt:
            date_str = dt.strftime('%Y-%m-%d')
            month_str = dt.strftime('%b %Y')
            day_str = days_map[dt.weekday()]
            hour_val = dt.hour

            date_counts[date_str] += 1
            month_counts[month_str] += 1
            day_of_week_counts[day_str] += 1
            hour_counts[hour_val] += 1

    most_active = participant_counts.most_common(1)[0][0] if participant_counts else 'N/A'
    participant_count = len(participant_counts)

    unique_days = len(date_counts)
    avg_per_day = round(total_messages / max(unique_days, 1), 1)

    user_analysis = []
    for author, count in participant_counts.items():
        pct = round((count / total_messages) * 100, 2)
        user_analysis.append({
            'name': author,
            'messages': count,
            'words': participant_words[author],
            'media': participant_media[author],
            'activityPercentage': pct
        })
    user_analysis.sort(key=lambda x: x['messages'], reverse=True)

    sorted_dates = sorted(date_counts.items(), key=lambda x: x[0])
    by_date = [{'date': d, 'count': c} for d, c in sorted_dates]

    by_month = [{'month': m, 'count': c} for m, c in month_counts.items()]
    by_day_of_week = [{'day': day, 'count': day_of_week_counts.get(day, 0)} for day in days_map]
    by_hour = [{'hour': h, 'count': hour_counts.get(h, 0)} for h in range(24)]

    word_freq = Counter(all_words).most_common(25)
    top_words = [{'word': w, 'count': c} for w, c in word_freq]

    emoji_freq = Counter(all_emojis).most_common(20)
    top_emojis = [{'emoji': e, 'count': c} for e, c in emoji_freq]

    return {
        'overall': {
            'totalMessages': total_messages,
            'totalWords': total_words,
            'totalMedia': total_media,
            'totalLinks': total_links,
            'participantCount': participant_count,
            'mostActiveParticipant': most_active,
            'avgMessagesPerDay': avg_per_day
        },
        'userAnalysis': user_analysis,
        'timeAnalysis': {
            'byDate': by_date,
            'byMonth': by_month,
            'byDayOfWeek': by_day_of_week,
            'byHour': by_hour
        },
        'contentAnalysis': {
            'topWords': top_words,
            'topEmojis': top_emojis,
            'sharedLinks': shared_links[:50],
            'mediaStats': {
                'totalMedia': total_media,
                'mediaByParticipant': dict(participant_media)
            }
        }
    }
