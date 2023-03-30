// deskStructure.js
export default (S) => S.list().title('Content').items([
    // ToDo: Configurar settings
    // S.listItem()
    //     .title('Settings')
    //     .child(
    //         S.editor()
    //             .id('settings')
    //             .schemaType('settings')
    //             .documentId('settings')
    //     ),
    ...S.documentTypeListItems().filter(listItem => !['settings'].includes(listItem.getId()))
])
