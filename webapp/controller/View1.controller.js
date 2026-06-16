sap.ui.define(
  ["sap/ui/core/mvc/Controller", 
    "sap/ui/model/json/JSONModel", 
    "zpj/pro/sd/sk/zprorevisionhead/model/formatter", 
    "sap/m/MessageBox",
    "sap/ui/model/Sorter",
    "sap/ui/core/Element",
    // "sap/m/table/columnmenu/MenuBase",
    // "sap/m/table/columnmenu/Menu",
    // "sap/m/table/columnmenu/QuickSort",
    // "sap/m/table/columnmenu/QuickSortItem",
    // "sap/m/Menu",
    // "sap/m/MenuItem"
  ],
  
  function (e,t,a,s, Sorter, Element, MenuBase, ColumnMenu, QuickSort, QuickSortItem, Menu, MenuItem) {
    "use strict";
    // Start: Sort001
    /**
     * Constructor for a new Menu adapter that implements the IColumnHeaderMenu interface.
     */
    // var CustomMenuAdapter = MenuBase.extend("MenuToColumnMenuAdapter", {
    //   metadata: {
    //     aggregations: {
    //       menu: { type: "sap.m.Menu", multiple: false }
    //     }
    //   }
    // });

    /**
     * Opens the menu at the specific target element.
     *
     * @param {sap.ui.core.Control | HTMLElement} oAnchor This is the control or HTMLElement where the menu is placed.
     */
    // CustomMenuAdapter.prototype.openBy = function (oAnchor) {
    //   const oMenu = this.getMenu();
    //   const fnResetBlocked = () => {
    //     if (this._blocked) {
    //       clearTimeout(this._blocked);
    //       this._blocked = null;
    //     }
    //   };

    //   if (!oMenu || ((this.isOpen() || this._blocked) && oAnchor === this._oIsOpenBy)) {
    //     fnResetBlocked();
    //     return;
    //   }

    //   fnResetBlocked();

    //   var oControl = oAnchor;
    //   if (!(oAnchor instanceof Element)) {
    //     oControl = Element.closestTo(oAnchor, true);
    //   }

    //   if (!this.fireBeforeOpen({ openBy: oControl })) {
    //     return;
    //   }

    //   // On click outside the menu, the sap.m.Menu closes automatically
    //   // to prevent reopening on column header click, we need to block the openBy call for a short time (200ms)
    //   oMenu.attachEventOnce("closed", () => {
    //     fnResetBlocked();
    //     this._blocked = setTimeout(fnResetBlocked, 200);
    //     this.fireAfterClose();
    //   });

    //   oMenu.openBy(oAnchor);
    //   this._oIsOpenBy = oAnchor;
    // };

    /**
     * Determines whether the menu is open.
     *
     * @returns {boolean} Whether the menu is open.
     */
    // CustomMenuAdapter.prototype.isOpen = function () {
    //   return this.getMenu()?.isOpen() || false;
    // };

    /**
     * Closes the menu.
     */
    // CustomMenuAdapter.prototype.close = function () {
    //   this.getMenu()?.close();
    // };

    /**
     * Returns the type of the menu.
     *
     * @returns {sap.ui.core.aria.HasPopup} Type of the menu
     * @public
     */
    // CustomMenuAdapter.prototype.getAriaHasPopupType = function () {
    //   return "Menu";
    // };
    // End: Sort001
    return e.extend("zpj.pro.sd.sk.zprorevisionhead.controller.View1", {
      formatter: a,
      onInit: function () {

        this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._onRouteMatched, this);
        // Start: Sort001
        // this.createHeaderMenus();
        
        
        // var oJSONModelForTable = new sap.ui.model.json.JSONModel();
        // this.getView().setModel( oJSONModelForTable,"JSONModelForTable");
        // this.getView().getModel("JSONModelForTable").refresh(true);
        this.getView().setModel(new t({ start: "", end: "" }), "dateRange");
      },
      _onRouteMatched: function (e) {
        var t = e.getParameter("arguments").ID;
        if (t === "Page1" || t === undefined || t === "") {
          this.onFilterBarClear();
          this.onSearch();
          // this.getView().byId("id.FilterBar").fireSearch();
        }

      },
      _getRequestData: function (e, a) { // DR change for filter
        var i = [];
        var r = new sap.ui.model.Filter([new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, e)], false);
        i.push(r);
        var o = "/ET_ZDI_TP_BILLSet";
        if (this.sVkbur) {
          // var o = new sap.ui.model.Filter([new sap.ui.model.Filter("Pafno", sap.ui.model.FilterOperator.EQ, this.sPafNo)], false);
          var n = new sap.ui.model.Filter([new sap.ui.model.Filter("Vkbur", sap.ui.model.FilterOperator.EQ, this.sVkbur)], false);
          // var u = new sap.ui.model.Filter([new sap.ui.model.Filter("Spart", sap.ui.model.FilterOperator.EQ, this.sSpart)], false);
          // a.push(o);
          i.push(n);
          // a.push(u);
        }
        this.getView().setBusy(true);
        this.getView()
          .getModel()
          .read(o, {
            filters: i,
            success: function (s) {
               var startDate = this.getView().getModel("dateRange").getProperty("/start"),
                        endDate = this.getView().getModel("dateRange").getProperty("/end");

                    if (startDate && endDate) {
                        var aItems = [];
                        var nTemp = 0;
                        for (let index = 0; index < s.results.length; index++) {
                            if (s.results[index].Erdat >= startDate && s.results[index].Erdat <= endDate) {
                                aItems.push(s.results[index]);
                                nTemp = 1;
                            }
                        }

                        if (nTemp === 1) {
                            s.results = aItems;
                        } else {
                            s.results = [];
                        }
                    }
              var i = [];
              this.getView().setBusy(false);
              if (a === "count") {
                switch (e) {
                  case "":
                    this.getView().getModel("count").getData().Total = s.results.length;
                    break;
                  case "P":
                    this.getView().getModel("count").getData().Pending = s.results.length;
                    break;
                  case "D":
                    this.getView().getModel("count").getData().Delayed = s.results.length;
                    break;
                  case "A":
                    this.getView().getModel("count").getData().Approved = s.results.length;
                    break;
                  case "R":
                    this.getView().getModel("count").getData().Rejected = s.results.length;
                    break;
                  case "DL":
                    this.getView().getModel("count").getData().Deleted = s.results.length;
                    break;
                  default:
                    break;
                }
              } else {
                // i.push(s.results);
                var n = s.results;

                this.getView().setModel(new t(n), "JSONModelForTable");

              }
              this.getView().getModel("count").refresh(true);
            }.bind(this),
            error: function (e) {
              this.getView().setBusy(false);
              s.error(JSON.parse(e.responseText).error.innererror.errordetails[0].message, {
                actions: [sap.m.MessageBox.Action.OK],
                onClose: function (e) { },
              });
            }.bind(this),
          });
      },


      onSearch: function () {

        this.sVkbur = this.getView().byId("id.SalesOffice.Input").getValue();
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
         this.getView().getModel("dateRange").setProperty("/start", "");
                this.getView().getModel("dateRange").setProperty("/end", "");

        // var oJSONModelForTable = new sap.ui.model.json.JSONModel();
        // this.getView().setModel( oJSONModelForTable,"JSONModelForTable");
        // this.getView().getModel("JSONModelForTable").refresh(true);

      },
      _onFilterSelect: function (e) {
        var t = e.getParameter("key");
        if (t === "All") {
          this._getRequestData("", "tableData");
          this.getView().byId("id.FilterBar").setVisible(true);
        } else if (t === "Pending") {
          this._getRequestData("P", "tableData");
          this.getView().byId("id.FilterBar").setVisible(false);
        } else if (t === "Approved") {
          this._getRequestData("A", "tableData");
          this.getView().byId("id.FilterBar").setVisible(false);
        } else if (t === "Delayed") {
          this._getRequestData("D", "tableData");
          this.getView().byId("id.FilterBar").setVisible(false);
        } else if (t === "Rejected") {
          this._getRequestData("R", "tableData");
          this.getView().byId("id.FilterBar").setVisible(false);
        } else if (t === "Deleted") {
          this._getRequestData("DL", "tableData");
          this.getView().byId("id.FilterBar").setVisible(false);
        }
      },
      onOrderNumber: function (e) {
        // var t = e.getParameter("value");
        // var a = new sap.ui.model.Filter({ path: "Pafno", operator: sap.ui.model.FilterOperator.Contains, value1: t });
        // var s = this.getView().byId("productsTable");
        // s.getBinding("items").filter(a);
        // s.setShowOverlay(false);
          var vValue = e.getParameter('value');
                var filter = new sap.ui.model.Filter({
                    path: 'Pafno',
                    operator: sap.ui.model.FilterOperator.Contains,
                    value1: vValue
                });

                //Start tableSort001
                // // Old
                // var oTable = this.getView().byId("productsTable");

                // oTable.getBinding("items").filter(filter);
                // oTable.setShowOverlay(false);
                // New
                var oTable = this.getView().byId("productsTable");
                oTable.getBinding("rows").filter(filter);
                oTable.setShowOverlay(false);

      },
      onClickofItem: function (e) {
        // this.oRouter = this.getOwnerComponent().getRouter();
        // this.oRouter.navTo("page2", { pafID: e.getSource().getCells()[0].getText() });
        // this.onInit();
        // this.onFilterBarClear();
        // this._onRouteMatched();
         var pafNo = e.getParameter("rowContext").getObject().Pafno;
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.navTo("page2", {
                    pafID: pafNo,
                });

      },
      onSalesOfficeHelp: function () {

        if (!this.SalesOfficerag) {
          this.SalesOfficerag = sap.ui.xmlfragment("zpj.pro.sd.sk.zprorevisionhead.view.fragments.View1.salesOfficeF4", this);
          this.getView().addDependent(this.SalesOfficerag);
          this._SalesOfficeTemp = sap.ui.getCore().byId("idSLSalesOfficeValueHelp").clone();
          this._oTemp = sap.ui.getCore().byId("idSLSalesOfficeValueHelp").clone();

          var sServicelUrl = "/sap/opu/odata/sap/ZCUSTOMER_AUTOMATIONDISCOUNT_SRV/";
          var oODataModel = new sap.ui.model.odata.v2.ODataModel(sServicelUrl);
          this.SalesOfficerag.setModel(oODataModel);
        }
        var e = [];
        var t = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname", sap.ui.model.FilterOperator.EQ, "TVKBZ")], false);
        var a = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname1", sap.ui.model.FilterOperator.EQ, "")], false);
        var i = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname2", sap.ui.model.FilterOperator.EQ, "")], false);
        e.push(t);
        e.push(a);
        e.push(i);
        sap.ui
          .getCore()
          .byId("idSDSalesOfficeF4")
          .bindAggregation("items", { path: "/ET_VALUE_HELPSSet", filters: e, template: this._SalesOfficeTemp });
        this.SalesOfficerag.open();
      },
      onValueHelpSearch: function (e) {
        var t = [];
        var a = e.getParameter("value");
        var i = "/ET_VALUE_HELPSSet";
        var s = sap.ui.getCore().byId(e.getParameter("id"));
        var r = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname", sap.ui.model.FilterOperator.EQ, "TVKBZ")], false);
        var l = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname1", sap.ui.model.FilterOperator.EQ, a)], false);
        t.push(r);
        t.push(l);
        s.bindAggregation("items", { path: i, filters: t, template: this._oTemp });
      },
      onValueHelpConfirm: function (e) {

        var t = e.getParameter("selectedItem");
        var a = t.getProperty("title");
        this.getView().byId("id.SalesOffice.Input").setValue(a);
        // this.byId(sap.ui.core.Fragment.createId("id.tableProductDetails.Fragment", "id.SalesOffice.Input")).setValue(a);
      },
      onSalesOfficeInputSubmit: function (e) {
        var t = e.getParameter("value"),
          a = [],
          i = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname", sap.ui.model.FilterOperator.EQ, "TVKBZ")], false),
          s = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname1", sap.ui.model.FilterOperator.EQ, t)], false),
          r = "/Vkbur",
          l = "",
          o = "Entered Sales Office is wrong";
        a.push(i);
        a.push(s);
      },
      onSuggest: function (e) {
        var a = e.getParameter("suggestValue"),
          s = [],
          r = "/ET_VALUE_HELPSSet",
          l,
          o,
          n;
        if (a.includes(",")) {
          var u = a.split(",").length;
          a = a.split(",")[a.split(",").length - 1];
        }
        l = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname", sap.ui.model.FilterOperator.EQ, "TVKBZ")], false);
        o = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname1", sap.ui.model.FilterOperator.EQ, a)], false);
        n = new sap.ui.model.Filter([new sap.ui.model.Filter("Domname2", sap.ui.model.FilterOperator.EQ, "")], false);
        s.push(l);
        s.push(n);
        s.push(o);
        if (a) {
          this.getView().setBusy(true);
          this.getView()
            .getModel()
            .read(r, {
              filters: s,
              success: function (e) {
                if (e.results.length > 0) {
                  var a = new t(e.results);
                  this.getView().setModel(a, "JSONModelForSuggest");
                  this.getView().getModel("JSONModelForSuggest").refresh(true);
                }
                this.getView().setBusy(false);
              }.bind(this),
              error: function (e) {
                this.getView().setBusy(false);
                i.error(JSON.parse(e.responseText).error.innererror.errordetails[0].message, {
                  actions: [sap.m.MessageBox.Action.OK],
                  onClose: function (e) { },
                });
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

        oColumnPAFNo.setHeaderMenu(new ColumnMenu({
          quickActions: [
            new QuickSort({
              items: new QuickSortItem({
                key: "Pafno",
                label: "Pafno"
              }),

              change: function (oEvent) {
                const oBinding = oTable.getBinding("items");
                const sSortOrder = oEvent.getParameter("item").getSortOrder();
                if (sSortOrder === "Ascending") {
                  oBinding.sort([new Sorter("Pafno", false)]);
                  oColumnPAFNo.setSortIndicator("Ascending");

                } else if (sSortOrder === "Descending") {
                  oBinding.sort([new Sorter("Pafno", true)]);
                  oColumnPAFNo.setSortIndicator("Descending");

                } else {
                  oColumnPAFNo.setSortIndicator("None");
                }
              }
            })
          ]
        }));
        oColumnSO.setHeaderMenu(new ColumnMenu({
          quickActions: [
            new QuickSort({
              items: new QuickSortItem({
                key: "Soname",
                label: "Soname"
              }),

              change: function (oEvent) {
                const oBinding = oTable.getBinding("items");
                const sSortOrder = oEvent.getParameter("item").getSortOrder();
                if (sSortOrder === "Ascending") {
                  oBinding.sort([new Sorter("Soname", false)]);
                  oColumnSO.setSortIndicator("Ascending");

                } else if (sSortOrder === "Descending") {
                  oBinding.sort([new Sorter("Soname", true)]);
                  oColumnSO.setSortIndicator("Descending");

                } else {
                  oColumnSO.setSortIndicator("None");
                }
              }
            })
          ]
        }));
        oColumnCustname.setHeaderMenu(new ColumnMenu({
          quickActions: [
            new QuickSort({
              items: new QuickSortItem({
                key: "Name",
                label: "Name"
              }),

              change: function (oEvent) {
                const oBinding = oTable.getBinding("items");
                const sSortOrder = oEvent.getParameter("item").getSortOrder();
                if (sSortOrder === "Ascending") {
                  oBinding.sort([new Sorter("Name", false)]);
                  oColumnCustname.setSortIndicator("Ascending");

                } else if (sSortOrder === "Descending") {
                  oBinding.sort([new Sorter("Name", true)]);
                  oColumnCustname.setSortIndicator("Descending");

                } else {
                  oColumnCustname.setSortIndicator("None");
                }
              }
            })
          ]
        }));
        oColumnCustid.setHeaderMenu(new ColumnMenu({
          quickActions: [
            new QuickSort({
              items: new QuickSortItem({
                key: "Kunnr",
                label: "Kunnr"
              }),

              change: function (oEvent) {
                const oBinding = oTable.getBinding("items");
                const sSortOrder = oEvent.getParameter("item").getSortOrder();
                if (sSortOrder === "Ascending") {
                  oBinding.sort([new Sorter("Kunnr", false)]);
                  oColumnCustid.setSortIndicator("Ascending");

                } else if (sSortOrder === "Descending") {
                  oBinding.sort([new Sorter("Kunnr", true)]);
                  oColumnCustid.setSortIndicator("Descending");

                } else {
                  oColumnCustid.setSortIndicator("None");
                }
              }
            })
          ]
        }));
        oColumnReqDate.setHeaderMenu(new ColumnMenu({
          quickActions: [
            new QuickSort({
              items: new QuickSortItem({
                key: "Erdat",
                label: "Erdat"
              }),

              change: function (oEvent) {
                const oBinding = oTable.getBinding("items");
                const sSortOrder = oEvent.getParameter("item").getSortOrder();
                if (sSortOrder === "Ascending") {
                  oBinding.sort([new Sorter("Erdat", false)]);
                  oColumnReqDate.setSortIndicator("Ascending");

                } else if (sSortOrder === "Descending") {
                  oBinding.sort([new Sorter("Erdat", true)]);
                  oColumnReqDate.setSortIndicator("Descending");

                } else {
                  oColumnReqDate.setSortIndicator("None");
                }
              }
            })
          ]
        }));
        oColumnValidity.setHeaderMenu(new ColumnMenu({
          quickActions: [
            new QuickSort({
              items: new QuickSortItem({
                key: "Validity",
                label: "Validity"
              }),

              change: function (oEvent) {
                const oBinding = oTable.getBinding("items");
                const sSortOrder = oEvent.getParameter("item").getSortOrder();
                if (sSortOrder === "Ascending") {
                  oBinding.sort([new Sorter("Validity", false)]);
                  oColumnReqDate.setSortIndicator("Ascending");

                } else if (sSortOrder === "Descending") {
                  oBinding.sort([new Sorter("Validity", true)]);
                  oColumnReqDate.setSortIndicator("Descending");

                } else {
                  oColumnReqDate.setSortIndicator("None");
                }
              }
            })
          ]
        }));


      }
      // End: Sort001
    });
  }
);
//# sourceMappingURL=View1.controller.js.map
