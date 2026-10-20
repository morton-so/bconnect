import json
import base64
import zipfile
import io
import re


def handler(event, context):
    try:
        body = event['body']
        is_base64 = event['isBase64Encoded']

        if is_base64:
            zip_data = base64.b64decode(body)
        else:
            zip_data = body.encode() if isinstance(body, str) else body

        posts = parse_instagram_zip(zip_data)

        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'count': len(posts),
                'posts': posts
            }, ensure_ascii=False)
        }

    except Exception as e:
        print(f'Error processing ZIP: {e}')
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'error': str(e)
            }, ensure_ascii=False)
        }


def parse_instagram_zip(zip_data: bytes) -> list:
    posts = []
    media_files = set()

    with zipfile.ZipFile(io.BytesIO(zip_data), 'r') as zf:
        for name in zf.namelist():
            if name.startswith('media/'):
                media_files.add(name)

            if 'your_instagram_activity/media/' in name and re.match(r'.*posts_\d+\.json$', name):
                try:
                    content = zf.read(name).decode('utf-8')
                    data = json.loads(content)

                    if 'media' in data and isinstance(data['media'], list):
                        for idx, media in enumerate(data['media']):
                            posts.append({
                                'id': f'{name}-{idx}',
                                'uri': media['uri'],
                                'caption': media['title'],
                                'timestamp': media['creation_timestamp'],
                                'type': get_media_type(media),
                                'hasMediaFile': media['uri'] in media_files
                            })
                except Exception as e:
                    print(f'Error parsing {name}: {e}')

    for post in posts:
        post['hasMediaFile'] = post['uri'] in media_files

    posts.sort(key=lambda x: x['timestamp'], reverse=True)

    return posts


def get_media_type(media: dict) -> str:
    uri = media['uri']
    metadata = media.get('media_metadata', {})

    if '.mp4' in uri or 'video_metadata' in metadata:
        return 'video'

    return 'image'
