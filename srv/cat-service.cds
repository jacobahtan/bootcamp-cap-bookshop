using {sap.capire.bookshop as my} from '../db/schema';

service CatalogService @(path : '/browse') {

    entity Books as
        select from my.Books {
            *, author.name as author
        }
        excluding {
            createdBy,
            modifiedBy
        };

    @requires_ : 'authenticated-user'
    action submitOrder(book : Books:ID, amount : Integer);
}