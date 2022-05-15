sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../model/formatter",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox"
], function(Controller,
	formatter,
	Fragment,
	MessageBox) {
	"use strict";

	return Controller.extend("sap.ui.demo.basicTemplate.controller.Home", {

		formatter: formatter,
		
		onInit: function () {
			var oView = this.getOwnerComponent();
			var oLang = {
				"LanguageCollection": [
					{
						"title": "Русский",
						"value": "ru_RU"
					},
					{
						"title": "English",
						"value": "en_EN"
					}
				]
			};
			
			var oLangModel = new sap.ui.model.json.JSONModel(oLang);
			oView.setModel(oLangModel, "language");

			var oCountry = new sap.ui.model.json.JSONModel();
			oCountry.loadData("proxy/http/restcountries.com/v2/all", null, true, 'GET');
			oView.setModel(oCountry, "Country");

			oView.setModel(new sap.ui.model.json.JSONModel(),"supplier");
		},

		onChangeLanguage: function (oEvent) {
			var language = oEvent.getParameter('selectedItem').getKey();
			sap.ui.getCore().getConfiguration().setLanguage(language);
		},

		onOpenDialog: function () {
			var oView = this.getView();  

			if (!this.byId('addSupplier')) {
				Fragment.load({
					id: oView.getId(),
					name: "sap.ui.demo.basicTemplate.view.addSupplier",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
				})
			} else {
				this.byId('addSupplier').open();
			}
		},

		onCloseDialog: function () {
			this.byId('addSupplier').close();
		},

		onSubmit: function () {
			var oView = this.getView();

			var isNullFields = false;

			var id 			= this.getView().byId("idSuppliersTable").getItems().length;
			var name 		= this.getOwnerComponent().getModel("supplier").getProperty("/name");
			var concurrency = this.getOwnerComponent().getModel("supplier").getProperty("/concurrency");
			var street 		= this.getOwnerComponent().getModel("supplier").getProperty("/street");
			var city 		= this.getOwnerComponent().getModel("supplier").getProperty("/city");
			var state 		= this.getOwnerComponent().getModel("supplier").getProperty("/state");
			var zipCode		= this.getOwnerComponent().getModel("supplier").getProperty("/zipCode");
			var country 	= this.getView().byId("country").getSelectedItem().getText();
			
			var newData = {
				"ID": id,
				"Name": name,
				"Concurrency": concurrency,
				"Address": {
					"Street": street,
					"City": city,
					"State": state,
					"ZipCode": zipCode,
					"Country": country
				}
			}

			for (var property in newData) {
				if (newData[property] == undefined ||
					newData[property] == null 	   ||
					newData[property] == '' 	   ||
					newData[property] == ' ')
					isNullFields = true;
				
				if (typeof newData[property] === 'object') {
					for (var addres in newData[property]) {
						if (newData[property][addres] == undefined ||
							newData[property][addres] == null 	   ||
							newData[property][addres] == '' 	   ||
							newData[property][addres] == ' ')
							isNullFields = true;
					}
				}
			}

			if (isNullFields) {
				return MessageBox.error("All fields are required!");
			}
			
			var oModel = new sap.ui.model.odata.v2.ODataModel("proxy/https/services.odata.org/V2/(S(plhh5wax2hmk5tsdhrobyjg5))/OData/OData.svc/");
			oModel.setUseBatch(false);
			oModel.setHeaders({
				"Content-type":"application/json"
			});

			oModel.create("/Suppliers", newData, {
				method: "POST", 
				success: function (oSuccess) {
					console.log("Success", oSuccess);	
					var oTable = oView.byId("idSuppliersTable");
					var oBinding = oTable.getBinding("items");
					oBinding.refresh();

					oView.byId('addSupplier').close();
					MessageBox.information("Supplier added!");
				},
				error: function (oError) { return console.log("Error", oError) }
			});
		}
	});
});