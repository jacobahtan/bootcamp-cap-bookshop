const _prepareBpBody = (bp) => {
    return {
        FirstName: bp.FirstName,
        LastName: bp.LastName,
        CategoryCode: bp.CategoryCode
    }
}

function formatByDBPResultsForCAPOData(businessPartners) {
    const jsonFormatForCAPOdataBP = [];
    businessPartners.forEach(businessPartner => {
        jsonFormatForCAPOdataBP.push(
            {
                BusinessPartner: businessPartner.InternalID,
                FirstName: businessPartner.FirstName,
                LastName: businessPartner.LastName,
                BusinessPartnerCategory: businessPartner.CategoryCode,
                FullName: businessPartner.BusinessPartnerFormattedName,
                PersonNumber: businessPartner.RoleCode
            });
    });
    return jsonFormatForCAPOdataBP;
}

module.exports = {
    formatByDBPResultsForCAPOData,
    _prepareBpBody
}