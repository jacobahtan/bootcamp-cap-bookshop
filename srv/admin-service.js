const cds = require('@sap/cds');
const axios = require('axios');
const xsenv = require('@sap/xsenv');
const bydDest = "BYD";  //  create a simple basic auth destination in your btp cockpit
const {
    formatByDBPResultsForCAPOData,
    _prepareBpBody
} = require('./helper');

module.exports = cds.service.impl(async function () {
    // Get the reflected entities defined in schema.cds defined 
    // You may expose other entities if you'd like to manipulate its events
    // e.g. const { Customers, Orders, Books } = this.entities;
    const { Customers } = this.entities;

    var authToken, bydDestUrl, xcsrfToken, cookies;

    getDestination(bydDest).then(dest => {
        authToken = "Basic " + dest.authTokens[0].value;
        bydDestUrl = dest.destinationConfiguration.URL;
        console.log("dest here, auth token automatically gen for you, so you may consume it on subsequent calls");
        console.log(dest);
    });

    // Hook on Create event
    this.after('CREATE', Customers, async (data, req) => {
        getDestination(bydDest).then(dest => {
            authToken = "Basic " + dest.authTokens[0].value;
            bydDestUrl = dest.destinationConfiguration.URL;
        });

        var axios = require('axios');

        var config = {
            method: 'post',
            url: bydDestUrl + "/sap/byd/odata/cust/v1/vmubusinesspartner/BusinessPartnerCollection",
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json',
                'x-csrf-token': xcsrfToken,
                'Accept': 'application/json',
                'Cookie': cookies
            },
            data: _prepareBpBody(data)
        };

        // console.log(data);

        axios(config)
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    });

    this.on('READ', Customers, async (req) => {
        getDestination(bydDest).then(dest => {
            authToken = "Basic " + dest.authTokens[0].value;
            bydDestUrl = dest.destinationConfiguration.URL;
        });

        var axios = require('axios');

        var config = {
            method: 'get',
            url: bydDestUrl + "/sap/byd/odata/cust/v1/vmubusinesspartner/BusinessPartnerCollection?$format=json&$filter=CategoryCode eq '1'&$select=InternalID,FirstName,LastName,BusinessPartnerFormattedName,RoleCode,CategoryCode",
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json',
                'x-csrf-token': 'fetch'
            }
        };

        return axios(config)
            .then(function (response) {
                // console.log(response);  //  data: { d: { results: [...
                // console.log(response.data.d.results);
                xcsrfToken = response.headers['x-csrf-token'];
                console.log(xcsrfToken);
                var a, b, c;
                a = response.headers['set-cookie'][0];
                b = response.headers['set-cookie'][1];
                c = response.headers['set-cookie'][2];
                cookies = a + ";" + b + ";" + c;
                console.log(cookies);
                var bydbupa = response.data.d.results;
                var x = formatByDBPResultsForCAPOData(bydbupa);
                // console.log(x);
                return x;

            })
            .catch(function (error) {
                // console.log(error);  
                //  vs code/bas, settings, scrollback, set to 100000 lines so u can see logs
            });
    });
});

/** Default Helper function to auth your app getting connected with SAP BTP Destination services and return Destination object. */
//  To Improve: replace with cloud sdk core
async function getDestination(dest) {
    try {
        xsenv.loadEnv();
        let services = xsenv.getServices({
            dest: { tag: 'destination' }
        });
        try {
            let options1 = {
                method: 'POST',
                url: services.dest.url + '/oauth/token?grant_type=client_credentials',
                headers: {
                    Authorization: 'Basic ' + Buffer.from(services.dest.clientid + ':' + services.dest.clientsecret).toString('base64')
                }
            };
            let res1 = await axios(options1);
            try {
                options2 = {
                    method: 'GET',
                    url: services.dest.uri + '/destination-configuration/v1/destinations/' + dest,
                    headers: {
                        Authorization: 'Bearer ' + res1.data.access_token
                    }
                };
                let res2 = await axios(options2);
                // return res2.data.destinationConfiguration;
                return res2.data;
            } catch (err) {
                console.log(err.stack);
                return err.message;
            }
        } catch (err) {
            console.log(err.stack);
            return err.message;
        }
    } catch (err) {
        console.log(err.stack);
        return err.message;
    }
};