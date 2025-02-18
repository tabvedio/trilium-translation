const notes = await api.runOnBackend(() => {
    return api.sql.getRows(`
        SELECT
            notes.noteId,
            LENGTH(note_contents.content) + COALESCE(SUM(LENGTH(note_revision_contents.content)), 0) AS size
        FROM notes
        JOIN note_contents ON notes.noteId=note_contents.noteId
        LEFT JOIN note_revisions ON note_revisions.noteId=notes.noteId
        LEFT JOIN note_revision_contents ON note_revisions.noteRevisionId=note_revision_contents.noteRevisionId
        WHERE notes.isDeleted = 0
        GROUP BY notes.noteId
        ORDER BY size DESC
        LIMIT 100`);
});

const $statsTable = api.$container.find('.stats-table');

function formatSize(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

for (const note of notes) {     
    $statsTable.append(
        $("<tr>")
            .append(
                $("<td>").append(await api.createNoteLink(note.noteId, {showNotePath: true}))
            ) 
            .append(
                //$("<td nowrap>").text(note.size + " bytes")
                $("<td nowrap>").text(formatSize(note.size))
            )
    );
}