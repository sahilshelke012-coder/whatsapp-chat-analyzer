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

POSITIVE_EMOJIS = {'😂', '😊', '❤️', '👍', '🔥', '🎉', '😃', '😄', '😍', '🙌', '👏', '😁', '🥳', '😎'}
NEGATIVE_EMOJIS = {'😡', '😢', '😭', '😠', '💔', '👎', '😒', '😞', '😩', '😤'}

POSITIVE_WORDS = {'good', 'great', 'awesome', 'thanks', 'thank', 'cool', 'super', 'excited', 'love', 'welcome', 'nice', 'perfect', 'haha', 'lol', 'happy', 'yes', 'yeah'}
NEGATIVE_WORDS = {'bad', 'worst', 'wrong', 'late', 'fail', 'hate', 'sorry', 'issue', 'bug', 'error', 'broken', 'sad', 'no', 'never', 'can\'t', 'cant', 'cannot', 'problem'}

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
                'avgMessagesPerDay': 0,
                'mostActiveDay': 'N/A',
                'peakActivityDate': 'N/A',
                'peakActivityHour': 'N/A',
                'overallMood': 'Neutral'
            },
            'userAnalysis': [],
            'timeAnalysis': {'byDate': [], 'byMonth': [], 'byDayOfWeek': [], 'byHour': []},
            'contentAnalysis': {
                'topWords': [],
                'topEmojis': [],
                'sharedLinks': [],
                'mediaStats': {'totalMedia': 0, 'mediaByParticipant': {}}
            },
            'sentimentAnalysis': {
                'positiveCount': 0,
                'positivePercentage': 0,
                'neutralCount': 0,
                'neutralPercentage': 0,
                'negativeCount': 0,
                'negativePercentage': 0,
                'overallMood': 'Neutral'
            },
            'velocityAnalysis': {
                'peakDate': 'N/A',
                'peakDateCount': 0,
                'peakHour': 'N/A',
                'peakHourCount': 0,
                'longestMessage': None
            },
            'chatPreview': []
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

    positive_msg_count = 0
    negative_msg_count = 0
    neutral_msg_count = 0

    longest_msg_obj = None
    max_words_in_single_msg = 0

    days_map = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    for m in user_messages:
        author = m['author']
        msg_text = m['message']
        dt = m['datetime']

        participant_counts[author] += 1

        # Check for media vs text
        if is_media_message(msg_text):
            total_media += 1
            participant_media[author] += 1
        else:
            words = [w.lower().strip('.,!?"\'():;') for w in msg_text.split() if w.strip()]
            word_count = len(words)
            total_words += word_count
            participant_words[author] += word_count

            if word_count > max_words_in_single_msg:
                max_words_in_single_msg = word_count
                longest_msg_obj = {
                    'author': author,
                    'message': msg_text[:120] + ('...' if len(msg_text) > 120 else ''),
                    'wordCount': word_count,
                    'date': dt.strftime('%Y-%m-%d %H:%M') if dt else 'Unknown'
                }

            for w in words:
                clean_w = re.sub(r'[^a-zA-Z0-9\u0900-\u097F]', '', w)
                if len(clean_w) > 2 and clean_w.lower() not in STOP_WORDS and not clean_w.isdigit():
                    all_words.append(clean_w.lower())

        # Sentiment / Message Tone Classifier
        emojis_in_msg = extract_emojis(msg_text)
        has_pos_emoji = any(e in POSITIVE_EMOJIS for e in emojis_in_msg)
        has_neg_emoji = any(e in NEGATIVE_EMOJIS for e in emojis_in_msg)
        
        msg_words = set(msg_text.lower().split())
        has_pos_word = any(w in msg_words for w in POSITIVE_WORDS)
        has_neg_word = any(w in msg_words for w in NEGATIVE_WORDS)

        if has_pos_emoji or has_pos_word:
            positive_msg_count += 1
        elif has_neg_emoji or has_neg_word:
            negative_msg_count += 1
        else:
            neutral_msg_count += 1

        # Link extraction
        urls = extract_urls(msg_text)
        if urls:
            total_links += len(urls)
            for u in urls:
                shared_links.append({
                    'url': u,
                    'sharedBy': author,
                    'date': dt.strftime('%Y-%m-%d %H:%M') if dt else 'Unknown'
                })

        if emojis_in_msg:
            all_emojis.extend(emojis_in_msg)

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
    most_active_day = day_of_week_counts.most_common(1)[0][0] if day_of_week_counts else 'N/A'

    # Peak Spurt Analysis
    peak_date_tuple = date_counts.most_common(1)[0] if date_counts else ('N/A', 0)
    peak_hour_tuple = hour_counts.most_common(1)[0] if hour_counts else ('N/A', 0)

    # Mood Percentages
    pos_pct = round((positive_msg_count / total_messages) * 100, 1)
    neg_pct = round((negative_msg_count / total_messages) * 100, 1)
    neu_pct = round((neutral_msg_count / total_messages) * 100, 1)

    if pos_pct >= neg_pct and pos_pct > 30:
        overall_mood = '🔥 Positive & Energetic'
    elif neg_pct > pos_pct:
        overall_mood = '⚠️ Critical / Concern'
    else:
        overall_mood = '💬 Balanced & Informative'

    user_analysis = []
    for author, count in participant_counts.items():
        pct = round((count / total_messages) * 100, 2)
        words_count = participant_words[author]
        avg_words_per_msg = round(words_count / max(count, 1), 1)
        user_analysis.append({
            'name': author,
            'messages': count,
            'words': words_count,
            'media': participant_media[author],
            'activityPercentage': pct,
            'avgWordsPerMessage': avg_words_per_msg
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

    # Chat Preview (first 25 messages)
    chat_preview = []
    for m in user_messages[:25]:
        chat_preview.append({
            'author': m['author'],
            'message': m['message'],
            'date': m['datetime'].strftime('%b %d, %Y %I:%M %p') if m['datetime'] else 'N/A',
            'isMedia': is_media_message(m['message'])
        })

    return {
        'overall': {
            'totalMessages': total_messages,
            'totalWords': total_words,
            'totalMedia': total_media,
            'totalLinks': total_links,
            'participantCount': participant_count,
            'mostActiveParticipant': most_active,
            'avgMessagesPerDay': avg_per_day,
            'mostActiveDay': most_active_day,
            'peakActivityDate': peak_date_tuple[0],
            'overallMood': overall_mood
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
        },
        'sentimentAnalysis': {
            'positiveCount': positive_msg_count,
            'positivePercentage': pos_pct,
            'neutralCount': neutral_msg_count,
            'neutralPercentage': neu_pct,
            'negativeCount': negative_msg_count,
            'negativePercentage': neg_pct,
            'overallMood': overall_mood
        },
        'velocityAnalysis': {
            'peakDate': peak_date_tuple[0],
            'peakDateCount': peak_date_tuple[1],
            'peakHour': f"{peak_hour_tuple[0]}:00",
            'peakHourCount': peak_hour_tuple[1],
            'longestMessage': longest_msg_obj
        },
        'chatPreview': chat_preview
    }
