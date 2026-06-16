sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "zpj/pro/sd/sk/zprorevisionhead/model/formatter",
    "sap/m/MessageBox",
    "sap/ui/model/Sorter",
    "sap/ui/core/Element",
  ], function (Controller, JSONModel, formatter, MessageBox, Sorter, Element) {
    "use strict";

    return Controller.extend("zpj.pro.sd.sk.zprorevisionhead.controller.View1", {
        formatter: formatter,

        onInit: function () {
          this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._onRouteMatched, this);
          this.getView().setModel(new JSONModel({ start: "", end: "" }), "dateRange",);
        },

        _onRouteMatched: function (oEvent) {
          var routeId = oEvent.getParameter("arguments").ID;
          if (routeId === "Page1" || routeId === undefined || routeId === "") {
            this.onFilterBarClear();
            this.onSearch();
          }
        },

        _getRequestData: function (statusKey, countType) {
          // DR change for filter
          var filters = [];
          var statusFilter = new sap.ui.model.Filter(
            [
              new sap.ui.model.Filter(
                "Status",
                sap.ui.model.FilterOperator.EQ,
                statusKey,
              ),
            ],
            false,
          );
          filters.push(statusFilter);
          var entitySetPath = "/ET_ZDI_TP_BILLSet";
          if (this.salesOfficeKey) {
            var vkburFilter = new sap.ui.model.Filter(
              [
                new sap.ui.model.Filter(
                  "Vkbur",
                  sap.ui.model.FilterOperator.EQ,
                  this.salesOfficeKey,
                ),
              ],
              false,
            );
            filters.push(vkburFilter);
          }
          if (this.divisionKey) {
            var divisionFilter = new sap.ui.model.Filter(
              [
                new sap.ui.model.Filter(
                  "Spart",
                  sap.ui.model.FilterOperator.EQ,
                  this.divisionKey,
                ),
              ],
              false,
            );
            filters.push(divisionFilter);
          }
          if (this.pafNumberValue) {
            var pafNoFilter = new sap.ui.model.Filter(
              [
                new sap.ui.model.Filter(
                  "Pafno",
                  sap.ui.model.FilterOperator.Contains,
                  this.pafNumberValue,
                ),
              ],
              false,
            );
            filters.push(pafNoFilter);
          }
          this.getView().setBusy(true);
          this.getView().getModel().read(entitySetPath, {
              filters: filters,
              success: function (response) {
                var startDate = this.getView().getModel("dateRange").getProperty("/start"),
                    endDate = this.getView().getModel("dateRange").getProperty("/end");

                if (startDate && endDate) {
                  var filteredResults = [];
                  var hasDateMatch = false;
                  for (let index = 0; index < response.results.length; index++) {
                    if (response.results[index].Erdat >= startDate &&
                      response.results[index].Erdat <= endDate) {
                        filteredResults.push(response.results[index]);
                        hasDateMatch = true;
                    }
                  }

                  if (hasDateMatch) {
                    response.results = filteredResults;
                  } else {
                    response.results = [];
                  }
                }
                this.getView().setBusy(false);
                if (countType === "count") {
                  switch (statusKey) {
                    case "":
                      this.getView().getModel("count").getData().Total = response.results.length;
                      break;
                    case "P":
                      this.getView().getModel("count").getData().Pending = response.results.length;
                      break;
                    case "D":
                      this.getView().getModel("count").getData().Delayed = response.results.length;
                      break;
                    case "A":
                      this.getView().getModel("count").getData().Approved = response.results.length;
                      break;
                    case "R":
                      this.getView().getModel("count").getData().Rejected = response.results.length;
                      break;
                    case "DL":
                      this.getView().getModel("count").getData().Deleted = response.results.length;
                      break;
                    default:
                      break;
                  }
                } else {
                  var tableResults = response.results;
                  this.getView().setModel(new JSONModel(tableResults), "JSONModelForTable");
                }
                this.getView().getModel("count").refresh(true);
              }.bind(this),
              error: function (errorResponse) {
                this.getView().setBusy(false);
                MessageBox.error(JSON.parse(errorResponse.responseText).error.innererror.errordetails[0].message, {
                    actions: [sap.m.MessageBox.Action.OK],
                    onClose: function (e) {},
                  },
                );
              }.bind(this),
            });
        },

        onSearch: function () {
          this.salesOfficeKey = this.getView().byId("id.SalesOffice.Input").getValue();
          this.divisionKey = this.getView().byId("id.Division.ComboBox").getSelectedKey();
          this.pafNumberValue = this.getView().byId("id.PafNo.Input").getValue();
          this.getView().byId("idIconTabBar").setSelectedKey("All");
          this.getView().byId("id.orderNumber.Input").setValue("");
          this._getRequestData("P", "count");
          this._getRequestData("A", "count");
          this._getRequestData("R", "count");
          this._getRequestData("DL", "count");
          this._getRequestData("", "count");
          this._getRequestData("", "tableData");
        },

        onFilterBarClear: function () {
          this.getView().byId("id.SalesOffice.Input").setValue("");
          this.getView().byId("id.Division.ComboBox").setSelectedKey("");
          this.getView().byId("id.PafNo.Input").setValue("");
          this.getView().getModel("dateRange").setProperty("/start", "");
          this.getView().getModel("dateRange").setProperty("/end", "");
          this.divisionKey = "";
          this.pafNumberValue = "";
        },

        _onFilterSelect: function (oEvent) {
          var selectedKey = oEvent.getParameter("key");
          if (selectedKey === "All") {
            this._getRequestData("", "tableData");
            this.getView().byId("id.FilterBar").setVisible(true);
          } else if (selectedKey === "Pending") {
            this._getRequestData("P", "tableData");
            this.getView().byId("id.FilterBar").setVisible(false);
          } else if (selectedKey === "Approved") {
            this._getRequestData("A", "tableData");
            this.getView().byId("id.FilterBar").setVisible(false);
          } else if (selectedKey === "Delayed") {
            this._getRequestData("D", "tableData");
            this.getView().byId("id.FilterBar").setVisible(false);
          } else if (selectedKey === "Rejected") {
            this._getRequestData("R", "tableData");
            this.getView().byId("id.FilterBar").setVisible(false);
          } else if (selectedKey === "Deleted") {
            this._getRequestData("DL", "tableData");
            this.getView().byId("id.FilterBar").setVisible(false);
          }
        },

        onOrderNumber: function (oEvent) {
            var searchValue = oEvent.getParameter("value");
            var pafFilter = new sap.ui.model.Filter({
              path: "Pafno",
              operator: sap.ui.model.FilterOperator.Contains,
              value1: searchValue,
            });
            var productsTable = this.getView().byId("productsTable");
            productsTable.getBinding("rows").filter(pafFilter);
            productsTable.setShowOverlay(false);
        },

        onClickofItem: function (oEvent) {
            var pafNo = oEvent.getParameter("rowContext").getObject().Pafno;
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.navTo("page2", {
              pafID: pafNo,
            });
        },

        onSalesOfficeHelp: function () {
            if (!this.salesOfficeDialog) {
              this.salesOfficeDialog = sap.ui.xmlfragment(
                "zpj.pro.sd.sk.zprorevisionhead.view.fragments.View1.salesOfficeF4",
                this,
              );
              this.getView().addDependent(this.salesOfficeDialog);

              this.salesOfficeSuggestionTemplate = sap.ui.getCore().byId("idSLSalesOfficeValueHelp").clone();
              this.salesOfficeValueHelpTemplate = sap.ui.getCore().byId("idSLSalesOfficeValueHelp").clone();

              var serviceUrl =  "/sap/opu/odata/sap/ZCUSTOMER_AUTOMATIONDISCOUNT_SRV/";
              var oDataModel = new sap.ui.model.odata.v2.ODataModel(serviceUrl);
              this.salesOfficeDialog.setModel(oDataModel);
            }

            var valueHelpFilters = [];
            var domnameFilter = new sap.ui.model.Filter([
                new sap.ui.model.Filter("Domname", sap.ui.model.FilterOperator.EQ, "TVKBZ"),
              ],
              false,
            );
            var domname1Filter = new sap.ui.model.Filter([
                new sap.ui.model.Filter("Domname1",sap.ui.model.FilterOperator.EQ, ""),
              ],
              false,
            );
            var domname2Filter = new sap.ui.model.Filter([
                new sap.ui.model.Filter("Domname2",sap.ui.model.FilterOperator.EQ, ""),
              ],
              false,
            );
            valueHelpFilters.push(domnameFilter);
            valueHelpFilters.push(domname1Filter);
            valueHelpFilters.push(domname2Filter);

            sap.ui.getCore().byId("idSDSalesOfficeF4").bindAggregation("items", {
              path: "/ET_VALUE_HELPSSet",
              filters: valueHelpFilters,
              template: this.salesOfficeSuggestionTemplate,
            });
            this.salesOfficeDialog.open();
        },

        onValueHelpSearch: function (oEvent) {
            var valueHelpFilters = [];
            var searchValue = oEvent.getParameter("value");
            var servicePath = "/ET_VALUE_HELPSSet";
            var valueHelpControl = sap.ui
              .getCore()
              .byId(oEvent.getParameter("id"));
            var domnameFilter = new sap.ui.model.Filter(
              [
                new sap.ui.model.Filter(
                  "Domname",
                  sap.ui.model.FilterOperator.EQ,
                  "TVKBZ",
                ),
              ],
              false,
            );
            var domname1Filter = new sap.ui.model.Filter(
              [
                new sap.ui.model.Filter(
                  "Domname1",
                  sap.ui.model.FilterOperator.EQ,
                  searchValue,
                ),
              ],
              false,
            );
            valueHelpFilters.push(domnameFilter);
            valueHelpFilters.push(domname1Filter);
            valueHelpControl.bindAggregation("items", {
              path: servicePath,
              filters: valueHelpFilters,
              template: this.salesOfficeValueHelpTemplate,
            });
        },

        onValueHelpConfirm: function (oEvent) {
            var selectedItem = oEvent.getParameter("selectedItem");
            var selectedTitle = selectedItem.getProperty("title");
            this.getView().byId("id.SalesOffice.Input").setValue(selectedTitle);
        },

        onSalesOfficeInputSubmit: function (oEvent) {
          var salesOfficeValue = oEvent.getParameter("value"),
            filters = [],
            domnameFilter = new sap.ui.model.Filter(
              [
                new sap.ui.model.Filter(
                  "Domname",
                  sap.ui.model.FilterOperator.EQ,
                  "TVKBZ",
                ),
              ],
              false,
            ),
            domname1Filter = new sap.ui.model.Filter(
              [
                new sap.ui.model.Filter(
                  "Domname1",
                  sap.ui.model.FilterOperator.EQ,
                  salesOfficeValue,
                ),
              ],
              false,
            ),
            servicePath = "/Vkbur",
            errorMessage = "Entered Sales Office is wrong";
          filters.push(domnameFilter);
          filters.push(domname1Filter);
        },

        onSuggest: function (oEvent) {
          var suggestValue = oEvent.getParameter("suggestValue"),
            suggestFilters = [],
            servicePath = "/ET_VALUE_HELPSSet",
            domnameFilter,
            domname1Filter,
            domname2Filter;
          if (suggestValue.includes(",")) {
            var lastPartIndex = suggestValue.split(",").length - 1;
            suggestValue = suggestValue.split(",")[lastPartIndex];
          }
          domnameFilter = new sap.ui.model.Filter(
            [
              new sap.ui.model.Filter(
                "Domname",
                sap.ui.model.FilterOperator.EQ,
                "TVKBZ",
              ),
            ],
            false,
          );
          domname1Filter = new sap.ui.model.Filter(
            [
              new sap.ui.model.Filter(
                "Domname1",
                sap.ui.model.FilterOperator.EQ,
                suggestValue,
              ),
            ],
            false,
          );
          domname2Filter = new sap.ui.model.Filter(
            [
              new sap.ui.model.Filter(
                "Domname2",
                sap.ui.model.FilterOperator.EQ,
                "",
              ),
            ],
            false,
          );
          suggestFilters.push(domnameFilter);
          suggestFilters.push(domname2Filter);
          suggestFilters.push(domname1Filter);
          if (suggestValue) {
            this.getView().setBusy(true);
            this.getView()
              .getModel()
              .read(servicePath, {
                filters: suggestFilters,
                success: function (suggestionResponse) {
                  if (suggestionResponse.results.length > 0) {
                    var suggestionModel = new JSONModel(
                      suggestionResponse.results,
                    );
                    this.getView().setModel(
                      suggestionModel,
                      "JSONModelForSuggest",
                    );
                    this.getView()
                      .getModel("JSONModelForSuggest")
                      .refresh(true);
                  }
                  this.getView().setBusy(false);
                }.bind(this),
                error: function (errorResponse) {
                  this.getView().setBusy(false);
                  MessageBox.error(
                    JSON.parse(errorResponse.responseText).error.innererror
                      .errordetails[0].message,
                    {
                      actions: [sap.m.MessageBox.Action.OK],
                      onClose: function (e) {},
                    },
                  );
                }.bind(this),
              });
          }
        },

        // Start: Sort001
        createHeaderMenus: function () {
          const oTable = this.getView().byId("productsTable");
          const aColumns = oTable.getColumns();
          const oColumnPAFNo = aColumns[0];
          const oColumnSO = aColumns[2];
          const oColumnCustname = aColumns[3];
          const oColumnCustid = aColumns[4];
          const oColumnReqDate = aColumns[8];
          const oColumnValidity = aColumns[9];

          oColumnPAFNo.setHeaderMenu(
            new ColumnMenu({
              quickActions: [
                new QuickSort({
                  items: new QuickSortItem({
                    key: "Pafno",
                    label: "Pafno",
                  }),

                  change: function (oEvent) {
                    const oBinding = oTable.getBinding("items");
                    const sSortOrder = oEvent
                      .getParameter("item")
                      .getSortOrder();
                    if (sSortOrder === "Ascending") {
                      oBinding.sort([new Sorter("Pafno", false)]);
                      oColumnPAFNo.setSortIndicator("Ascending");
                    } else if (sSortOrder === "Descending") {
                      oBinding.sort([new Sorter("Pafno", true)]);
                      oColumnPAFNo.setSortIndicator("Descending");
                    } else {
                      oColumnPAFNo.setSortIndicator("None");
                    }
                  },
                }),
              ],
            }),
          );
          oColumnSO.setHeaderMenu(
            new ColumnMenu({
              quickActions: [
                new QuickSort({
                  items: new QuickSortItem({
                    key: "Soname",
                    label: "Soname",
                  }),

                  change: function (oEvent) {
                    const oBinding = oTable.getBinding("items");
                    const sSortOrder = oEvent
                      .getParameter("item")
                      .getSortOrder();
                    if (sSortOrder === "Ascending") {
                      oBinding.sort([new Sorter("Soname", false)]);
                      oColumnSO.setSortIndicator("Ascending");
                    } else if (sSortOrder === "Descending") {
                      oBinding.sort([new Sorter("Soname", true)]);
                      oColumnSO.setSortIndicator("Descending");
                    } else {
                      oColumnSO.setSortIndicator("None");
                    }
                  },
                }),
              ],
            }),
          );
          oColumnCustname.setHeaderMenu(
            new ColumnMenu({
              quickActions: [
                new QuickSort({
                  items: new QuickSortItem({
                    key: "Name",
                    label: "Name",
                  }),

                  change: function (oEvent) {
                    const oBinding = oTable.getBinding("items");
                    const sSortOrder = oEvent
                      .getParameter("item")
                      .getSortOrder();
                    if (sSortOrder === "Ascending") {
                      oBinding.sort([new Sorter("Name", false)]);
                      oColumnCustname.setSortIndicator("Ascending");
                    } else if (sSortOrder === "Descending") {
                      oBinding.sort([new Sorter("Name", true)]);
                      oColumnCustname.setSortIndicator("Descending");
                    } else {
                      oColumnCustname.setSortIndicator("None");
                    }
                  },
                }),
              ],
            }),
          );
          oColumnCustid.setHeaderMenu(
            new ColumnMenu({
              quickActions: [
                new QuickSort({
                  items: new QuickSortItem({
                    key: "Kunnr",
                    label: "Kunnr",
                  }),

                  change: function (oEvent) {
                    const oBinding = oTable.getBinding("items");
                    const sSortOrder = oEvent
                      .getParameter("item")
                      .getSortOrder();
                    if (sSortOrder === "Ascending") {
                      oBinding.sort([new Sorter("Kunnr", false)]);
                      oColumnCustid.setSortIndicator("Ascending");
                    } else if (sSortOrder === "Descending") {
                      oBinding.sort([new Sorter("Kunnr", true)]);
                      oColumnCustid.setSortIndicator("Descending");
                    } else {
                      oColumnCustid.setSortIndicator("None");
                    }
                  },
                }),
              ],
            }),
          );
          oColumnReqDate.setHeaderMenu(
            new ColumnMenu({
              quickActions: [
                new QuickSort({
                  items: new QuickSortItem({
                    key: "Erdat",
                    label: "Erdat",
                  }),

                  change: function (oEvent) {
                    const oBinding = oTable.getBinding("items");
                    const sSortOrder = oEvent
                      .getParameter("item")
                      .getSortOrder();
                    if (sSortOrder === "Ascending") {
                      oBinding.sort([new Sorter("Erdat", false)]);
                      oColumnReqDate.setSortIndicator("Ascending");
                    } else if (sSortOrder === "Descending") {
                      oBinding.sort([new Sorter("Erdat", true)]);
                      oColumnReqDate.setSortIndicator("Descending");
                    } else {
                      oColumnReqDate.setSortIndicator("None");
                    }
                  },
                }),
              ],
            }),
          );
          oColumnValidity.setHeaderMenu(
            new ColumnMenu({
              quickActions: [
                new QuickSort({
                  items: new QuickSortItem({
                    key: "Validity",
                    label: "Validity",
                  }),

                  change: function (oEvent) {
                    const oBinding = oTable.getBinding("items");
                    const sSortOrder = oEvent
                      .getParameter("item")
                      .getSortOrder();
                    if (sSortOrder === "Ascending") {
                      oBinding.sort([new Sorter("Validity", false)]);
                      oColumnReqDate.setSortIndicator("Ascending");
                    } else if (sSortOrder === "Descending") {
                      oBinding.sort([new Sorter("Validity", true)]);
                      oColumnReqDate.setSortIndicator("Descending");
                    } else {
                      oColumnReqDate.setSortIndicator("None");
                    }
                  },
                }),
              ],
            }),
          );
        },
        // End: Sort001
      },
    );
  },
);
//# sourceMappingURL=View1.controller.js.map
