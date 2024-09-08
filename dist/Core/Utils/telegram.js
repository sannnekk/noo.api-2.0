function escapeSpecialTelegramCharacters(text) {
    return text
        .replace(/~/g, '\\~')
        .replace(/>/g, '\\>')
        .replace(/#/g, '\\#')
        .replace(/!/g, '\\!');
}
export async function send(userTelegramId, message, token) {
    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: userTelegramId,
                text: escapeSpecialTelegramCharacters(message),
                // set parse mode to the text where * is bold, _ is italic, etc.
                parse_mode: 'MarkdownV2',
            }),
        });
    }
    catch (error) { }
}
