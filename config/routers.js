module.exports = [
  {
    path: "/exception/403",
    component: "Exception/403",
    models: []
  },
  {
    path: "/exception/404",
    component: "Exception/404",
    models: []
  },
  {
    path: "/exception/500",
    component: "Exception/500",
    models: []
  },
  {
    path: "/exception/trigger",
    component: "Exception/triggerException",
    models: [
      "error"
    ]
  },
  {
    path: "/hagd/saga",
    component: "hagd/Saga",
    models: [
      "hagd/saga"
    ]
  },
  {
    path: "/hagd/saga-instance",
    component: "hagd/SagaInstance",
    models: [
      "hagd/sagaInstance"
    ]
  },
  {
    path: "/hcnf/hystrix",
    models: [
      "hcnf/hystrix"
    ],
    components: [
      {
        path: "/hcnf/hystrix/list",
        component: "hcnf/Hystrix",
        models: [
          "hcnf/hystrix"
        ]
      },
      {
        path: "/hcnf/hystrix/detail/:confId",
        component: "hcnf/Hystrix/Detail",
        models: [
          "hcnf/hystrix"
        ]
      },
    ]
  },
  {
    path: "/hcnf/service-config",
    component: "hcnf/ServiceConfig",
    models: [
      "hcnf/hcnfServiceConfig"
    ]
  },
  {
    path: "/hcnf/service-manage",
    component: "hcnf/ServiceManage",
    models: [
      "hcnf/hcnfServiceManage"
    ]
  },
  {
    path: "/hcnf/service-route",
    component: "hcnf/ServiceRoute",
    models: [
      "hcnf/hcnfServiceRoute"
    ]
  },
  {
    path: "/hcnf/zuul-limit",
    models: [
      "hcnf/zuulRateLimit"
    ],
    components: [
      {
        path: "/hcnf/zuul-limit/list",
        component: "hcnf/ZuulRateLimit",
        models: [
          "hcnf/zuulRateLimit"
        ]
      },
      {
        path: "/hcnf/zuul-limit/detail/:rateLimitId",
        component: "hcnf/ZuulRateLimit/RateLimitDetail",
        models: [
          "hcnf/zuulRateLimit"
        ]
      },
    ]
  },
  {
    path: "/hdtt/init-process",
    models: [
      "hdtt/initialProcess"
    ],
    components: [
      {
        path: "/hdtt/init-process/list",
        component: "hdtt/InitialProcess/List",
        models: [
          "hdtt/initialProcess"
        ]
      },
      {
        path: "/hdtt/init-process/detail/:sqlProcessId",
        component: "hdtt/InitialProcess/Detail",
        models: [
          "hdtt/initialProcess"
        ]
      },
    ]
  },
  {
    path: "/hdtt/producer-config",
    models: [],
    components: [
      {
        path: "/hdtt/producer-config/list",
        component: "hdtt/ProducerConfig",
        models: [
          "hdtt/producerConfig"
        ]
      },
      {
        path: "/hdtt/producer-config/allocation/:producerConfigId/:tableName",
        component: "hdtt/ProducerConfig/Allocation",
        models: [
          "hdtt/producerConfig"
        ]
      },
    ]
  },
  {
    path: "/hfile/file-aggregate",
    component: "hfile/FileAggregate",
    models: [
      "hfile/fileAggregate"
    ]
  },
  {
    path: "/hfile/file-upload",
    component: "hfile/FileUpload",
    models: [
      "hfile/fileUpload"
    ]
  },
  {
    path: "/hfile/storage",
    component: "hfile/Storage",
    models: [
      "hfile/storage"
    ]
  },
  {
    path: "/hiam/client",
    component: "hiam/Client",
    models: [
      "hiam/client"
    ]
  },
  {
    path: "/hiam/doc-type",
    component: "hiam/DocType",
    models: [
      "hiam/docType"
    ]
  },
  {
    path: "/hiam/ldap",
    component: "hiam/LDAP",
    models: [
      "hiam/ldap"
    ]
  },
  {
    path: "/hiam/menu",
    component: "hiam/MenuConfig",
    models: [
      "hiam/menuConfig"
    ]
  },
  {
    path: "/hiam/open-app",
    component: "hiam/OpenApp",
    models: [
      "hiam/openApp"
    ]
  },
  {
    path: "/hiam/password-policy",
    component: "hiam/PasswordPolicy",
    models: [
      "hiam/passwordPolicy"
    ]
  },
  {
    path: "/hiam/role",
    component: "hiam/RoleManagement",
    models: [
      "hiam/roleManagement"
    ]
  },
  {
    path: "/hiam/sub-account-org",
    models: [],
    components: [
      {
        path: "/hiam/sub-account-org/users",
        component: "hiam/SubAccount/Org",
        models: [
          "hiam/subAccountOrg"
        ]
      },
      {
        path: "/hiam/sub-account-org/authority-management",
        component: "hiam/SubAccount/Org/AuthorityManagement",
        models: [
          "hiam/authorityManagement/authorityManagement",
          "hiam/authorityManagement/authorityCompany",
          "hiam/authorityManagement/authorityCustomer",
          "hiam/authorityManagement/authoritySupplier",
          "hiam/authorityManagement/authorityPurorg",
          "hiam/authorityManagement/authorityPuragent",
          "hiam/authorityManagement/authorityPurcat"
        ]
      },
      {
        authorized: true,
        path: "/hiam/sub-account-org/data-import/:code",
        component: "himp/CommentImport",
        models: []
      },
    ]
  },
  {
    path: "/hiam/sub-account-site",
    component: "hiam/SubAccount/Site",
    models: [
      "hiam/subAccount"
    ]
  },
  {
    path: "/hiam/user",
    models: [],
    components: [
      {
        authorized: true,
        title: "hzero.common.title.userInfo",
        icon: "user",
        key: "/hiam/user",
        path: "/hiam/user/info",
        component: "hiam/UserInfo",
        models: [
          "hiam/userInfo",
          "hmsg/userReceiveConfig"
        ]
      },
      {
        path: "/hiam/user-group-management",
        component: "hiam/UserGroupManagement",
        models: [
          "hiam/userGroupManagement"
        ]
      },
      {
        authorized: true,
        title: "hzero.common.title.userInfo",
        icon: "user",
        key: "/hiam/user",
        path: "/hiam/user/login-log",
        component: "hpfm/PersonalLoginRecord",
        models: [
          "hpfm/personalLoginRecord"
        ]
      }
    ]
  },
  {
    path: "/himp/template",
    models: [
      "himp/template"
    ],
    components: [
      {
        path: "/himp/template/list",
        component: "himp/Template/List",
        models: [
          "himp/template"
        ]
      },
      {
        path: "/himp/template/column/:id/:sheetId",
        component: "himp/Template/Detail/Column",
        models: [
          "himp/template"
        ]
      },
      {
        path: "/himp/template/detail/:id",
        component: "himp/Template/Detail",
        models: [
          "himp/template"
        ]
      },
    ]
  },
  {
    path: "/hitf/application",
    component: "hitf/Application",
    models: [
      "hitf/application"
    ]
  },
  {
    path: "/hitf/interface-logs",
    models: [
      "hitf/interfaceLogs"
    ],
    components: [
      {
        path: "/hitf/interface-logs/list",
        component: "hitf/InterfaceLogs",
        models: [
          "hitf/interfaceLogs"
        ]
      },
      {
        path: "/hitf/interface-logs/detail/:interfaceLogId",
        component: "hitf/InterfaceLogs/Detail",
        models: [
          "hitf/interfaceLogs"
        ]
      },
    ]
  },
  {
    path: "/hitf/services",
    component: "hitf/Services",
    models: [
      "hitf/services"
    ]
  },
  {
    path: "/hmsg/email",
    component: "hmsg/Email",
    models: [
      "hmsg/email"
    ]
  },
  {
    path: "/hmsg/message-query",
    component: "hmsg/MessageQuery",
    models: [
      "hmsg/messageQuery"
    ]
  },
  {
    path: "/hmsg/message-template",
    models: [],
    components: [
      {
        path: "/hmsg/message-template/list",
        component: "hmsg/MessageTemplate/List",
        models: [
          "hmsg/messageTemplate"
        ]
      },
      {
        path: "/hmsg/message-template/create",
        component: "hmsg/MessageTemplate/Detail",
        models: [
          "hmsg/messageTemplate"
        ]
      },
      {
        path: "/hmsg/message-template/detail/:id",
        component: "hmsg/MessageTemplate/Detail",
        models: [
          "hmsg/messageTemplate"
        ]
      },
    ]
  },
  {
    path: "/hmsg/receive-config",
    component: "hmsg/ReceiveConfig",
    models: [
      "hmsg/receiveConfig"
    ]
  },
  {
    path: "/hmsg/receiver-type",
    component: "hmsg/ReceiverType",
    models: [
      "hmsg/receiverType"
    ]
  },
  {
    path: "/hmsg/send-config",
    models: [
      "hmsg/sendConfig"
    ],
    components: [
      {
        path: "/hmsg/send-config/list",
        component: "hmsg/SendConfig/List",
        models: [
          "hmsg/sendConfig"
        ]
      },
      {
        path: "/hmsg/send-config/create",
        component: "hmsg/SendConfig/Detail",
        models: [
          "hmsg/sendConfig"
        ]
      },
      {
        path: "/hmsg/send-config/detail/:id",
        component: "hmsg/SendConfig/Detail",
        models: [
          "hmsg/sendConfig"
        ]
      },
    ]
  },
  {
    path: "/hmsg/sms-config",
    component: "hmsg/SMSConfig",
    models: [
      "hmsg/smsConfig"
    ]
  },
  {
    path: "/hmsg/sms-template",
    component: "hmsg/SMSTemplate",
    models: [
      "hmsg/smsTemplate"
    ]
  },
  {
    path: "/hmsg/user-message",
    models: [],
    components: [
      {
        authorized: true,
        title: "hzero.common.title.userMessage",
        key: "/hmsg/user-message",
        path: "/hmsg/user-message/list",
        component: "hmsg/UserMessage",
        models: [
          "hmsg/userMessage"
        ]
      },
      {
        authorized: true,
        title: "hzero.common.title.userMessage",
        key: "/hmsg/user-message",
        path: "/hmsg/user-message/detail/:messageId",
        component: "hmsg/UserMessage/MessageDetail",
        models: [
          "hmsg/userMessage"
        ]
      },
    ]
  },
  {
    path: "/hpfm/card-manage",
    component: "hpfm/CardManage",
    models: [
      "hpfm/cardManage"
    ]
  },
  {
    path: "/hpfm/code-rule",
    models: [
      "hpfm/codeRule"
    ],
    components: [
      {
        path: "/hpfm/code-rule/list",
        component: "hpfm/CodeRule/CodeRuleList",
        models: [
          "hpfm/codeRule"
        ]
      },
      {
        path: "/hpfm/code-rule/dist/:id",
        component: "hpfm/CodeRule/CodeRuleDist",
        models: [
          "hpfm/codeRule"
        ]
      },
    ],
  },
  {
    path: "/hpfm/code-rule-org",
    models: [
      "hpfm/codeRuleOrg"
    ],
    components: [
      {
        path: "/hpfm/code-rule-org/list",
        component: "hpfm/CodeRuleOrg/CodeRuleList",
        models: [
          "hpfm/codeRuleOrg"
        ]
      },
      {
        path: "/hpfm/code-rule-org/dist/:id",
        component: "hpfm/CodeRuleOrg/CodeRuleDist",
        models: [
          "hpfm/codeRuleOrg"
        ]
      },
    ]
  },
  {
    path: "/hpfm/config",
    component: "hpfm/Config",
    models: [
      "hpfm/config"
    ]
  },
  {
    path: "/hpfm/dashboard-clause",
    models: [
      "hpfm/dashboardClause"
    ],
    components: [
      {
        path: "/hpfm/dashboard-clause/list",
        component: "hpfm/DashboardClause",
        models: [
          "hpfm/dashboardClause"
        ]
      },
      {
        path: "/hpfm/dashboard-clause/create",
        component: "hpfm/DashboardClause/Detail",
        models: [
          "hpfm/dashboardClause"
        ]
      },
      {
        path: "/hpfm/dashboard-clause/detail/:clauseId",
        component: "hpfm/DashboardClause/Detail",
        models: [
          "hpfm/dashboardClause"
        ]
      },
    ]
  },
  {
    path: "/hpfm/data-source",
    component: "hpfm/DataSource",
    models: [
      "hpfm/dataSource"
    ]
  },
  {
    path: "/hpfm/database",
    component: "hpfm/Database",
    models: [
      "hpfm/database"
    ]
  },
  {
    path: "/hpfm/event",
    models: [],
    components: [
      {
        path: "/hpfm/event/list",
        component: "hpfm/Event/EventList",
        models: [
          "hpfm/event"
        ]
      },
      {
        path: "/hpfm/event/detail/:id",
        component: "hpfm/Event/EventDetail",
        models: [
          "hpfm/event"
        ]
      },
      {
        path: "/hpfm/event/message/:id",
        component: "hpfm/Event/EventMessage",
        models: [
          "hpfm/event"
        ]
      }
    ]
  },
  {
    path: "/hpfm/financial-code",
    models: [],
    components: [
      {
        path: "/hpfm/financial-code/list",
        component: "hpfm/FinancialCode",
        models: [
          "hpfm/financialCode"
        ]
      }
    ]
  },
  {
    path: "/hpfm/hr/org",
    models: [
      "hpfm/organization"
    ],
    components: [
      {
        path: "/hpfm/hr/org/company",
        component: "hpfm/Organization",
        models: [
          "hpfm/organization"
        ]
      },
      {
        path: "/hpfm/hr/org/department/:companyId",
        component: "hpfm/Department",
        models: [
          "hpfm/department"
        ]
      },
      {
        path: "/hpfm/hr/org/post/:unitId",
        component: "hpfm/Post",
        models: [
          "hpfm/post"
        ]
      },
      {
        path: "/hpfm/hr/org/staff/:positionId",
        component: "hpfm/Staff",
        models: [
          "hpfm/staff"
        ]
      }
    ]
  },
  {
    path: "/hpfm/hr/staff",
    models: [],
    components: [
      {
        path: "/hpfm/hr/staff/list",
        component: "hpfm/Employee/List",
        models: [
          "hpfm/employee"
        ]
      },
      {
        path: "/hpfm/hr/staff/detail/:employeeId/:employeeNum",
        component: "hpfm/Employee/Detail",
        models: [
          "hpfm/employee"
        ]
      },
    ]
  },
  {
    path: "/hpfm/languages",
    component: "hpfm/Languages",
    models: [
      "hpfm/languages"
    ]
  },
  {
    path: "/hpfm/lov-view",
    models: [
      "hpfm/lovSetting"
    ],
    components: [
      {
        path: "/hpfm/lov-view/lov-view-list",
        component: "hpfm/Lov/LovSetting",
        models: [
          "hpfm/lovSetting"
        ]
      },
      {
        path: "/hpfm/lov-view/detail/:id",
        component: "hpfm/Lov/Detail",
        models: [
          "hpfm/lovSetting"
        ]
      },
    ]
  },
  {
    path: "/hpfm/mdm/bank",
    component: "hpfm/Bank/BankList",
    models: [
      "hpfm/bank"
    ]
  },
  {
    path: "/hpfm/mdm/calendar",
    models: [],
    components: [
      {
        path: "/hpfm/mdm/calendar/list",
        component: "hpfm/Calendar/List",
        models: [
          "hpfm/calendar"
        ]
      },
      {
        path: "/hpfm/mdm/calendar/detail/:calendarId",
        component: "hpfm/Calendar/Detail",
        models: [
          "hpfm/calendar"
        ]
      },
    ]
  },
  {
    path: "/hpfm/mdm/country",
    models: [],
    components: [
      {
        path: "/hpfm/mdm/country/list",
        component: "hpfm/Country",
        models: [
          "hpfm/country"
        ]
      },
      {
        path: "/hpfm/mdm/country/region/:id/:code/:name",
        component: "hpfm/Region",
        models: [
          "hpfm/region"
        ]
      }
    ]
  },
  {
    path: "/hpfm/mdm/currency",
    component: "hpfm/Currency/CurrencyList",
    models: [
      "hpfm/currency"
    ]
  },
  {
    path: "/hpfm/mdm/industry-category",
    component: "hpfm/IndustryCategory",
    models: [
      "hpfm/industryCategory"
    ]
  },
  {
    path: "/hpfm/mdm/period",
    component: "hpfm/Period",
    models: [
      "hpfm/period"
    ]
  },
  {
    path: "/hpfm/mdm/rate",
    component: "hpfm/Rate",
    models: [
      "hpfm/rate"
    ]
  },
  {
    path: "/hpfm/mdm/rate-type",
    component: "hpfm/RateType",
    models: [
      "hpfm/rateType"
    ]
  },
  {
    path: "/hpfm/mdm/tax-rate",
    component: "hpfm/TaxRate",
    models: [
      "hpfm/taxRate"
    ]
  },
  {
    path: "/hpfm/mdm/uom",
    component: "hpfm/Uom",
    models: [
      "hpfm/uom"
    ]
  },
  {
    path: "/hpfm/mdm/uom-type",
    component: "hpfm/UomType",
    models: [
      "hpfm/uomType"
    ]
  },
  {
    path: "/hpfm/message",
    component: "hpfm/Message",
    models: [
      "hpfm/message"
    ]
  },
  {
    path: "/hpfm/org-info",
    component: "hpfm/OrgInfo",
    models: [
      "hpfm/group"
    ]
  },
  {
    path: "/hpfm/org-info/company",
    component: "hpfm/OrgInfo/Company",
    models: [
      "hpfm/company"
    ]
  },
  {
    path: "/hpfm/org-info/group",
    component: "hpfm/OrgInfo/Group",
    models: [
      "hpfm/group"
    ]
  },
  {
    path: "/hpfm/org-info/inventory-org",
    component: "hpfm/OrgInfo/InventoryOrg",
    models: [
      "hpfm/inventoryOrg"
    ]
  },
  {
    path: "/hpfm/org-info/library-position",
    component: "hpfm/OrgInfo/LibraryPosition",
    models: [
      "hpfm/libraryPosition"
    ]
  },
  {
    path: "/hpfm/org-info/operation-unit",
    component: "hpfm/OrgInfo/OperationUnit",
    models: [
      "hpfm/operationUnit"
    ]
  },
  {
    path: "/hpfm/org-info/purchase-agent",
    component: "hpfm/OrgInfo/PurchaseAgent",
    models: [
      "hpfm/purchaseAgent"
    ]
  },
  {
    path: "/hpfm/org-info/purchase-org",
    component: "hpfm/OrgInfo/PurchaseOrg",
    models: [
      "hpfm/purchaseOrg"
    ]
  },
  {
    path: "/hpfm/org-info/store-room",
    component: "hpfm/OrgInfo/StoreRoom",
    models: [
      "hpfm/storeRoom"
    ]
  },
  {
    path: "/hpfm/permission",
    component: "hpfm/Permission",
    models: []
  },
  {
    path: "/hpfm/permission/range",
    component: "hpfm/Permission/Range",
    models: [
      "hpfm/permission"
    ]
  },
  {
    path: "/hpfm/permission/rule",
    component: "hpfm/Permission/Rule",
    models: [
      "hpfm/permission"
    ]
  },
  {
    path: "/hpfm/platform-log",
    component: "hpfm/PlatformManager",
    models: [
      "hpfm/platformManager"
    ]
  },
  {
    path: "/hpfm/profile",
    component: "hpfm/Profile/Site",
    models: [
      "hpfm/profile"
    ]
  },
  {
    path: "/hpfm/profile-org",
    component: "hpfm/Profile/Org",
    models: [
      "hpfm/profileOrg"
    ]
  },
  {
    path: "/hpfm/prompt",
    component: "hpfm/Prompt",
    models: [
      "hpfm/prompt"
    ]
  },
  {
    path: "/hpfm/rule-engine",
    models: [
      "hpfm/ruleEngine"
    ],
    components: [
      {
        path: "/hpfm/rule-engine/list",
        component: "hpfm/RuleEngine/List",
        models: [
          "hpfm/ruleEngine"
        ]
      },
      {
        path: "/hpfm/rule-engine/create",
        component: "hpfm/RuleEngine/Detail",
        models: [
          "hpfm/ruleEngine"
        ]
      },
      {
        path: "/hpfm/rule-engine/detail/:id",
        component: "hpfm/RuleEngine/Detail",
        models: [
          "hpfm/ruleEngine"
        ]
      },
    ]
  },
  {
    path: "/hpfm/sql-execute",
    component: "hpfm/SqlExecute",
    models: [
      "hpfm/sqlExecute"
    ]
  },
  {
    path: "/hpfm/static-text",
    models: [
      "hpfm/staticText"
    ],
    components: [
      {
        path: "/hpfm/static-text/list",
        component: "hpfm/StaticText/Site",
        models: [
          "hpfm/staticText"
        ]
      },
      {
        path: "/hpfm/static-text/detail/:action",
        component: "hpfm/StaticText/Site/Detail",
        models: [
          "hpfm/staticText"
        ]
      },
    ],
  },
  {
    path: "/hpfm/static-text-org",
    models: [
      "hpfm/staticTextOrg"
    ],
    components: [
      {
        path: "/hpfm/static-text-org/list",
        component: "hpfm/StaticText/Org",
        models: [
          "hpfm/staticTextOrg"
        ]
      },
      {
        path: "/hpfm/static-text-org/detail/:action",
        component: "hpfm/StaticText/Org/Detail",
        models: [
          "hpfm/staticTextOrg"
        ]
      },
    ]
  },
  {
    path: "/hpfm/stock/stock-org",
    component: "hpfm/Stock/StockOrg",
    models: [
      "hpfm/stockOrg"
    ]
  },
  {
    path: "/hpfm/tenant-log",
    component: "hpfm/TenantManager",
    models: [
      "hpfm/tenantManager"
    ]
  },
  {
    path: "/hpfm/tenants",
    component: "hpfm/Tenants",
    models: [
      "hpfm/tenants"
    ]
  },
  {
    path: "/hpfm/ui",
    models: [],
    components: [
      {
        path: "/hpfm/ui/page",
        models: [],
        components: [
          {
            path: "/hpfm/ui/page/list",
            component: "hpfm/UI/Site/PageList",
            models: [
              "hpfm/uiPage"
            ]
          },
          {
            path: "/hpfm/ui/page/detail/:pageCode",
            component: "hpfm/UI/Site/PageDetail",
            models: [
              "hpfm/uiPage"
            ]
          },
        ],
      },
      {
        path: "/hpfm/ui/page-org",
        models: [],
        components: [
          {
            path: "/hpfm/ui/page-org/list",
            component: "hpfm/UI/Org/PageList",
            models: [
              "hpfm/uiPageOrg"
            ]
          },
          {
            path: "/hpfm/ui/page-org/detail/:pageCode",
            component: "hpfm/UI/Org/PageDetail",
            models: [
              "hpfm/uiPageOrg"
            ]
          },
        ]
      },
      {
        title: "hzero.common.title.uiPagePreview",
        authorized: true,
        icon: "search",
        path: "/hpfm/ui/page/common/:pageCode",
        component: "hpfm/UI/Common",
        models: []
      },
      {
        title: "hzero.common.title.uiPagePreview",
        authorized: true,
        icon: "search",
        path: "/hpfm/ui/page/preview/:pageCode",
        component: "hpfm/UI/Site/PagePreview",
        models: []
      },
    ]
  },
  {
    path: "/hpfm/value-list",
    models: [
      "hpfm/valueList"
    ],
    components: [
      {
        path: "/hpfm/value-list/list",
        component: "hpfm/ValueList",
        models: [
          "hpfm/valueList"
        ]
      },
      {
        path: "/hpfm/value-list/detail/:lovId",
        component: "hpfm/ValueList/ValueDetail",
        models: [
          "hpfm/valueList"
        ]
      },
    ]
  },
  {
    path: "/hptl/notices",
    models: [],
    components: [
      {
        path: "/hptl/notices/list",
        component: "hptl/Notice",
        models: [
          "hptl/notice"
        ]
      },
      {
        path: "/hptl/notices/detail/:noticeId",
        component: "hptl/Notice/NoticeDetail",
        models: [
          "hptl/notice"
        ]
      },
    ]
  },
  {
    path: "/hptl/portal-assign",
    models: [],
    components: [
      {
        path: "/hptl/portal-assign/list",
        component: "hptl/PortalAssign",
        models: [
          "hptl/portalAssign"
        ]
      },
      {
        path: "/hptl/portal-assign/template/:groupId/:companyId",
        component: "hptl/PortalAssign/Template",
        models: [
          "hptl/portalAssign"
        ]
      },
      {
        path: "/hptl/portal-assign/template/edit/:companyId/:configId/:groupId/:templateName",
        component: "hptl/PortalAssign/TemplateEdit",
        models: [
          "hptl/portalAssign",
          "hptl/templatesConfig"
        ]
      }
    ]
  },
  {
    path: "/hptl/templates",
    component: "hptl/Templates",
    models: [
      "hptl/templates"
    ]
  },
  {
    path: "/hptl/templates-config",
    models: [],
    components: [
      {
        path: "/hptl/templates-config/list",
        component: "hptl/TemplatesConfig",
        models: [
          "hptl/templatesConfig",
          "hpfm/group"
        ]
      },
      {
        path: "/hptl/templates-config/edit/:configId/:templateName",
        component: "hptl/TemplatesConfig/TemplateEdit",
        models: [
          "hptl/portalAssign",
          "hptl/templatesConfig"
        ]
      },
    ]
  },
  {
    path: "/hrpt/data-set",
    models: [
      "hrpt/dataSet"
    ],
    components: [
      {
        path: "/hrpt/data-set/list",
        component: "hrpt/DataSet/List",
        models: [
          "hrpt/dataSet"
        ]
      },
      {
        path: "/hrpt/data-set/create",
        component: "hrpt/DataSet/Detail",
        models: [
          "hrpt/dataSet"
        ]
      },
      {
        path: "/hrpt/data-set/detail/:id",
        component: "hrpt/DataSet/Detail",
        models: [
          "hrpt/dataSet"
        ]
      },
    ]
  },
  {
    path: "/hrpt/report-definition",
    models: [
      "hrpt/reportDefinition"
    ],
    components: [
      {
        path: "/hrpt/report-definition/list",
        component: "hrpt/ReportDefinition/List",
        models: [
          "hrpt/reportDefinition"
        ]
      },
      {
        path: "/hrpt/report-definition/create",
        component: "hrpt/ReportDefinition/Detail",
        models: [
          "hrpt/reportDefinition"
        ]
      },
      {
        path: "/hrpt/report-definition/detail/:id",
        component: "hrpt/ReportDefinition/Detail",
        models: [
          "hrpt/reportDefinition"
        ]
      },
    ]
  },
  {
    path: "/hrpt/report-query",
    models: [
      "hrpt/reportQuery"
    ],
    components: [
      {
        path: "/hrpt/report-query/list",
        component: "hrpt/ReportQuery/List",
        models: [
          "hrpt/reportQuery"
        ]
      },
      {
        path: "/hrpt/report-query/detail/:id",
        component: "hrpt/ReportQuery/Detail",
        models: [
          "hrpt/reportQuery"
        ]
      },
    ]
  },
  {
    path: "/hrpt/report-request",
    component: "hrpt/ReportRequest",
    models: [
      "hrpt/reportRequest"
    ]
  },
  {
    path: "/hrpt/template-manage",
    models: [
      "hrpt/templateManage"
    ],
    components: [
      {
        path: "/hrpt/template-manage/list",
        component: "hrpt/TemplateManage/List",
        models: [
          "hrpt/templateManage"
        ]
      },
      {
        path: "/hrpt/template-manage/create",
        component: "hrpt/TemplateManage/Detail",
        models: [
          "hrpt/templateManage"
        ]
      },
      {
        path: "/hrpt/template-manage/detail/:id",
        component: "hrpt/TemplateManage/Detail",
        models: [
          "hrpt/templateManage"
        ]
      },
    ]
  },
  {
    path: "/hsdr/conc-request",
    component: "hsdr/ConcRequest",
    models: [
      "hsdr/concRequest"
    ]
  },
  {
    path: "/hsdr/concurrent",
    models: [
      "hsdr/concurrent"
    ],
    components: [
      {
        path: "/hsdr/concurrent/list",
        component: "hsdr/Concurrent/List",
        models: [
          "hsdr/concurrent"
        ]
      },
      {
        path: "/hsdr/concurrent/detail/:id",
        component: "hsdr/Concurrent/Detail",
        models: [
          "hsdr/concurrent"
        ]
      },
    ]
  },
  {
    path: "/hsdr/executable",
    component: "hsdr/Executable",
    models: [
      "hsdr/executable"
    ]
  },
  {
    path: "/hsdr/job-group",
    component: "hsdr/JobGroup",
    models: [
      "hsdr/jobGroup"
    ]
  },
  {
    path: "/hsdr/job-info",
    models: [
      "hsdr/jobInfo"
    ],
    components: [
      {
        path: "/hsdr/job-info/list",
        component: "hsdr/JobInfo",
        models: [
          "hsdr/jobInfo"
        ]
      },
      {
        path: "/hsdr/job-info/glue/:id",
        component: "hsdr/JobInfo/Glue",
        models: [
          "hsdr/jobInfo"
        ]
      },
      {
        path: "/hsdr/job-info/log/:jobId",
        component: "hsdr/JobLog",
        models: [
          "hsdr/jobLog"
        ]
      }
    ]
  },
  {
    path: "/hsdr/job-log",
    component: "hsdr/JobLog",
    models: [
      "hsdr/jobLog"
    ]
  },
  {
    path: "/hsgp/api-manage",
    component: "hsgp/ApiManage",
    models: [
      "hsgp/apiManage"
    ]
  },
  {
    path: "/hsgp/app-source",
    component: "hsgp/AppSource",
    models: [
      "hsgp/appSource"
    ]
  },
  {
    path: "/hsgp/deploy-platform",
    component: "hsgp/DeployPlatform",
    models: [
      "hsgp/deployPlatform"
    ]
  },
  {
    path: "/hsgp/env",
    models: [
      "hsgp/env"
    ],
    components: [
      {
        path: "/hsgp/env/list",
        component: "hsgp/Env",
        models: [
          "hsgp/env"
        ]
      }
    ]
  },
  {
    path: "/hsgp/node-gray-group",
    models: [
      "hsgp/nodeGrayGroup"
    ],
    components: [
      {
        path: "/hsgp/node-gray-group/list",
        component: "hsgp/NodeGrayGroup",
        models: [
          "hsgp/nodeGrayGroup"
        ]
      },
      {
        path: "/hsgp/node-gray-group/gray-range",
        component: "hsgp/NodeGrayGroup/GrayRange",
        models: [
          "hsgp/nodeGrayGroup"
        ]
      },
    ]
  },
  {
    path: "/hsgp/node-group",
    models: [
      "hsgp/nodeGroup"
    ],
    components: [
      {
        path: "/hsgp/node-group/list",
        component: "hsgp/NodeGroup",
        models: [
          "hsgp/nodeGroup"
        ]
      },
      {
        path: "/hsgp/node-group/:productId/:productEnvId/:nodeGroupId",
        component: "hsgp/NodeGroup/Config",
        models: [
          "hsgp/nodeGroup"
        ]
      },
      {
        path: "/hsgp/node-group/:productId/:productEnvId/:nodeGroupId/app",
        component: "hsgp/NodeGroup/Config/AppInfo",
        models: [
          "hsgp/nodeGroup"
        ]
      },
      {
        path: "/hsgp/node-group/:productId/:productEnvId/:nodeGroupId/config",
        component: "hsgp/NodeGroup/Config/ConfigInfo",
        models: [
          "hsgp/nodeGroup"
        ]
      },
      {
        path: "/hsgp/node-group/:productId/:productEnvId/:nodeGroupId/preview",
        component: "hsgp/NodeGroup/Config/PreviewInfo",
        models: [
          "hsgp/nodeGroup"
        ]
      },
      {
        path: "/hsgp/node-group/:productId/:productEnvId/:nodeGroupId/version",
        component: "hsgp/NodeGroup/Config/VersionInfo",
        models: [
          "hsgp/nodeGroup"
        ]
      },
    ]
  },
  {
    path: "/hsgp/node-rule",
    models: [
      "hsgp/nodeRule"
    ],
    components: [
      {
        path: "/hsgp/node-rule/list",
        component: "hsgp/NodeRule",
        models: [
          "hsgp/nodeRule"
        ]
      },
      {
        path: "/hsgp/node-rule/config/:productId/:productEnvId/:nodeRuleId",
        component: "hsgp/NodeRule/Editor",
        models: [
          "hsgp/nodeRule"
        ]
      },
    ]
  },
  {
    path: "/hsgp/product-collect",
    models: [
      "hsgp/product"
    ],
    components: [
      {
        path: "/hsgp/product-collect/list",
        component: "hsgp/Product",
        models: [
          "hsgp/product"
        ]
      },
      {
        path: "/hsgp/product-collect/version/:productId/:productName",
        component: "hsgp/Product/Version",
        models: [
          "hsgp/productVersion"
        ]
      }
    ]
  },
  {
    path: "/hsgp/product-env",
    component: "hsgp/ProductEnv",
    models: [
      "hsgp/productEnv"
    ]
  },
  {
    path: "/hsgp/product-service",
    models: [
      "hsgp/productService"
    ],
    components: [
      {
        path: "/hsgp/product-service/list",
        component: "hsgp/ProductService",
        models: [
          "hsgp/productService"
        ]
      },
      {
        path: "/hsgp/product-service/topology/:productId/:productVersionId/:productName/:versionName",
        component: "hsgp/ProductService/Topology",
        models: [
          "hsgp/productService"
        ]
      }
    ]
  },
  {
    path: "/hsgp/service-collect",
    models: [
      "hsgp/serviceCollect"
    ],
    components: [
      {
        path: "/hsgp/service-collect/list",
        component: "hsgp/ServiceCollect",
        models: [
          "hsgp/serviceCollect"
        ]
      },
      {
        path: "/hsgp/service-collect/version/:serviceId/:serviceName/:sourceKey",
        component: "hsgp/ServiceCollect/VersionManage",
        models: [
          "hsgp/versionManage"
        ]
      }
    ]
  },
  {
    path: "/hsgp/service-config",
    component: "hsgp/ServiceConfig",
    models: [
      "hsgp/serviceConfig"
    ]
  },
  {
    path: "/hsgp/service-rely",
    component: "hsgp/ServiceRely",
    models: [
      "hsgp/serviceRely"
    ]
  },
  {
    path: "/hsgp/service-route",
    component: "hsgp/ServiceRoute",
    models: [
      "hsgp/serviceRoute"
    ]
  },
  {
    path: "/hwfl/setting/approve-auth",
    models: [
      "hwfl/approveAuth"
    ],
    components: [
      {
        path: "/hwfl/setting/approve-auth/list",
        component: "hwfl/ApproveAuth/List",
        models: [
          "hwfl/approveAuth"
        ]
      },
      {
        path: "/hwfl/setting/approve-auth/create",
        component: "hwfl/ApproveAuth/Detail",
        models: [
          "hwfl/approveAuth"
        ]
      },
      {
        path: "/hwfl/setting/approve-auth/detail/:id",
        component: "hwfl/ApproveAuth/Detail",
        models: [
          "hwfl/approveAuth"
        ]
      },
    ]
  },
  {
    path: "/hwfl/setting/approve-rule",
    models: [
      "hwfl/approveRule"
    ],
    components: [
      {
        path: "/hwfl/setting/approve-rule/list",
        component: "hwfl/ApproveRule/List",
        models: [
          "hwfl/approveRule"
        ]
      },
      {
        path: "/hwfl/setting/approve-rule/create",
        component: "hwfl/ApproveRule/Detail",
        models: [
          "hwfl/approveRule"
        ]
      },
      {
        path: "/hwfl/setting/approve-rule/detail/:id",
        component: "hwfl/ApproveRule/Detail",
        models: [
          "hwfl/approveRule"
        ]
      },
    ]
  },
  {
    path: "/hwfl/setting/approve-way",
    models: [
      "hwfl/approveWay"
    ],
    components: [
      {
        path: "/hwfl/setting/approve-way/list",
        component: "hwfl/ApproveWay/List",
        models: [
          "hwfl/approveWay"
        ]
      },
      {
        path: "/hwfl/setting/approve-way/create",
        component: "hwfl/ApproveWay/Detail",
        models: [
          "hwfl/approveWay"
        ]
      },
      {
        path: "/hwfl/setting/approve-way/detail/:id",
        component: "hwfl/ApproveWay/Detail",
        models: [
          "hwfl/approveWay"
        ]
      },
    ]
  },
  {
    path: "/hwfl/setting/categories",
    component: "hwfl/Categories",
    models: [
      "hwfl/categories"
    ]
  },
  {
    path: "/hwfl/setting/condition",
    models: [
      "hwfl/condition"
    ],
    components: [
      {
        path: "/hwfl/setting/condition/list",
        component: "hwfl/Condition/List",
        models: [
          "hwfl/condition"
        ]
      },
      {
        path: "/hwfl/setting/condition/create",
        component: "hwfl/Condition/Detail",
        models: [
          "hwfl/condition"
        ]
      },
      {
        path: "/hwfl/setting/condition/detail/:id",
        component: "hwfl/Condition/Detail",
        models: [
          "hwfl/condition"
        ]
      },
    ]
  },
  {
    path: "/hwfl/setting/expression-service",
    models: [
      "hwfl/expressionService"
    ],
    components: [
      {
        path: "/hwfl/setting/expression-service/list",
        component: "hwfl/ExpressionService/List",
        models: [
          "hwfl/expressionService"
        ]
      },
      {
        path: "/hwfl/setting/expression-service/create",
        component: "hwfl/ExpressionService/Detail",
        models: [
          "hwfl/expressionService"
        ]
      },
      {
        path: "/hwfl/setting/expression-service/detail/:id",
        component: "hwfl/ExpressionService/Detail",
        models: [
          "hwfl/expressionService"
        ]
      },
    ]
  },
  {
    path: "/hwfl/setting/form-manage",
    component: "hwfl/FormManage",
    models: [
      "hwfl/formManage"
    ]
  },
  {
    path: "/hwfl/setting/interface-map",
    component: "hwfl/InterfaceMap",
    models: [
      "hwfl/interfaceMap"
    ]
  },
  {
    path: "/hwfl/setting/listener-manage",
    component: "hwfl/ListenerManage",
    models: [
      "hwfl/listenerManage"
    ]
  },
  {
    path: "/hwfl/setting/message-service",
    models: [
      "hwfl/messageService"
    ],
    components: [
      {
        path: "/hwfl/setting/message-service/list",
        component: "hwfl/MessageService/List",
        models: [
          "hwfl/messageService"
        ]
      },
      {
        path: "/hwfl/setting/message-service/create",
        component: "hwfl/MessageService/Detail",
        models: [
          "hwfl/messageService"
        ]
      },
      {
        path: "/hwfl/setting/message-service/detail/:id",
        component: "hwfl/MessageService/Detail",
        models: [
          "hwfl/messageService"
        ]
      },
    ]
  },
  {
    path: "/hwfl/setting/process-define",
    models: [
      "hwfl/processDefine"
    ],
    components: [
      {
        path: "/hwfl/setting/process-define/list",
        component: "hwfl/ProcessDefine",
        models: [
          "hwfl/processDefine"
        ]
      },
      {
        path: "/hwfl/setting/process-define/deploy/:id",
        component: "hwfl/ProcessDefine/DeployHistory",
        models: [
          "hwfl/processDefine"
        ]
      },
    ]
  },
  {
    path: "/hwfl/setting/process-start",
    component: "hwfl/ProcessStart",
    models: [
      "hwfl/processStart"
    ]
  },
  {
    path: "/hwfl/setting/process-variable",
    component: "hwfl/ProcessVariable",
    models: [
      "hwfl/processVariable"
    ]
  },
  {
    path: "/hwfl/setting/service-task",
    models: [
      "hwfl/serviceTask"
    ],
    components: [
      {
        path: "/hwfl/setting/service-task/create",
        component: "hwfl/ServiceTask/Detail",
        models: [
          "hwfl/serviceTask"
        ]
      },
      {
        path: "/hwfl/setting/service-task/detail/:id",
        component: "hwfl/ServiceTask/Detail",
        models: [
          "hwfl/serviceTask"
        ]
      },
      {
        path: "/hwfl/setting/service-task/list",
        component: "hwfl/ServiceTask/List",
        models: [
          "hwfl/serviceTask"
        ]
      }
    ]
  },
  {
    path: "/hwfl/workflow/carbon-copy-task",
    models: [
      "hwfl/carbonCopyTask"
    ],
    components: [
      {
        path: "/hwfl/workflow/carbon-copy-task/list",
        component: "hwfl/CarbonCopyTask/List",
        models: [
          "hwfl/carbonCopyTask"
        ]
      },
      {
        authorized: true,
        path: "/hwfl/workflow/carbon-copy-task/detail/:id",
        component: "hwfl/CarbonCopyTask/Detail",
        models: [
          "hwfl/carbonCopyTask"
        ]
      },
    ]
  },
  {
    path: "/hwfl/workflow/delegate",
    component: "hwfl/Delegate",
    models: [
      "hwfl/delegate"
    ]
  },
  {
    path: "/hwfl/workflow/exception",
    component: "hwfl/Exception",
    models: [
      "hwfl/exception"
    ]
  },
  {
    path: "/hwfl/workflow/involved-task",
    models: [
      "hwfl/involvedTask"
    ],
    components: [
      {
        path: "/hwfl/workflow/involved-task/list",
        component: "hwfl/InvolvedTask/List",
        models: [
          "hwfl/involvedTask"
        ]
      },
      {
        authorized: true,
        path: "/hwfl/workflow/involved-task/detail/:id",
        component: "hwfl/InvolvedTask/Detail",
        models: [
          "hwfl/involvedTask"
        ]
      },
    ]
  },
  {
    path: "/hwfl/workflow/monitor",
    models: [
      "hwfl/monitor"
    ],
    components: [
      {
        path: "/hwfl/workflow/monitor/list",
        component: "hwfl/Monitor/List",
        models: [
          "hwfl/monitor"
        ]
      },
      {
        path: "/hwfl/workflow/monitor/create",
        component: "hwfl/Monitor/Detail",
        models: [
          "hwfl/monitor"
        ]
      },
      {
        path: "/hwfl/workflow/monitor/detail/:id",
        component: "hwfl/Monitor/Detail",
        models: [
          "hwfl/monitor"
        ]
      },
    ]
  },
  {
    path: "/hwfl/workflow/task",
    models: [
      "hwfl/task"
    ],
    components: [
      {
        path: "/hwfl/workflow/task/list",
        component: "hwfl/Task/List",
        models: [
          "hwfl/task"
        ]
      },
      {
        authorized: true,
        path: "/hwfl/workflow/task/detail/:id",
        component: "hwfl/Task/Detail",
        models: [
          "hwfl/task"
        ]
      },
    ]
  },
  {
    path: "/workplace",
    component: "Dashboard/Workplace",
    models: [
      "hpfm/workplace",
      "hptl/portalAssign",
      "dashboard/cards"
    ]
  }
]
