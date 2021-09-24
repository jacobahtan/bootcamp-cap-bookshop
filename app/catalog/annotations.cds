using CatalogService from '../../srv/cat-service';


// Default CRUD operations automated for OData V4
annotate CatalogService.Books with @odata.draft.enabled;

/**
 * Book Related Annotations
 */
annotate CatalogService.Books with @(UI : {
    HeaderInfo        : {
        TypeName       : '{i18n>Book}',
        TypeNamePlural : '{i18n>Books}',
        Title          : {Value : title},
        Description    : {Value : author}
    },
    HeaderFacets      : [{
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>Description}',
        Target : '@UI.FieldGroup#Descr'
    }, ],
    Facets            : [{
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>Details}',
        Target : '@UI.FieldGroup#Price'
    }, ],
    FieldGroup #Descr : {Data : [
        {Value : image_url},
        {Value : descr}
    ]},
    FieldGroup #Price : {Data : [
        {Value : price},
        {
            Value : currency.symbol,
            Label : '{i18n>Currency}'
        },
        {Value : stock}
    ]},
});

annotate CatalogService.Books with @(UI : {
    SelectionFields : [
        ID,
        author,
        price,
        currency_code
    ],
    LineItem        : [
        {Value : image_url},
        {Value : title},
        {
            Value : author,
            Label : '{i18n>authorName}'
        },
        {Value : stock},
        {Value : price},
        {
            Value : currency.symbol,
            Label : ' '
        }
    ]
});
