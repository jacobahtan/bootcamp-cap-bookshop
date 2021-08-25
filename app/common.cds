/**
 * Common Annotations shared by all apps
 */
using {sap.capire.bookshop as my} from '../db/schema';

/**
 * Book Related Annotations
 */
annotate my.Books with {
    ID        @title : '{i18n>ID}'  @UI.HiddenFilter;
    title     @title : '{i18n>Title}';
    author    @title : '{i18n>AuthorID}';
    price     @title : '{i18n>Price}';
    stock     @title : '{i18n>Stock}';
    descr     @UI.MultiLineText;
    image_url @(
        Common.Label  : 'Image',
        UI.IsImageURL : true
    );
}

annotate my.Books with @(UI : {Identification : [{Value : title}]}) {
    author @ValueList.entity : 'Authors';
};

/**
 * Author Related Annotations
 */
annotate my.Authors with {
    ID   @title : '{i18n>ID}'  @UI.HiddenFilter;
    name @title : '{i18n>authorName}';
}

annotate my.Authors with @(UI : {Identification : [{Value : name}], });
