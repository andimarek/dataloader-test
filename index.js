const { graphql } = require('graphql');
const { makeExecutableSchema } = require('apollo-server');
const { _ } = require('lodash');

const DataLoader = require('dataloader');

const departmentsForShopDataLoader = new DataLoader(departmentsForShopBatch);
const productsForDepartmentDataLoader = new DataLoader(productsForDepartmentsBatch, { cache: false });


const shops = [
  {
    id: "shop-1",
    name: "Shop 1",
    departments: ["department-1", "department-2", "department-3"]
  },
  {
    id: "shop-2",
    name: "Shop 2",
    departments: ["department-4", "department-5", "department-6"]
  },
  {
    id: "shop-3",
    name: "Shop 3",
    departments: ["department-7", "department-8", "department-9"]
  }
];

const expensiveShops = [
  {
    id: "exshop-1",
    name: "ExShop 1",
    departments: ["department-1", "department-2", "department-3"]
  },
  {
    id: "exshop-2",
    name: "ExShop 2",
    departments: ["department-4", "department-5", "department-6"]
  },
  {
    id: "exshop-3",
    name: "ExShop 3",
    departments: ["department-7", "department-8", "department-9"]
  }
];


const products = [
  {
    id: "product-1",
    name: "Product 1"
  },
  {
    id: "product-2",
    name: "Product 2"
  },
  {
    id: "product-3",
    name: "Product 3"
  },
  {
    id: "product-4",
    name: "Product 4"
  },
  {
    id: "product-5",
    name: "Product 5"
  },
  {
    id: "product-6",
    name: "Product 6"
  },
  {
    id: "product-7",
    name: "Product 7"
  },
  {
    id: "product-8",
    name: "Product 8"
  },
  {
    id: "product-9",
    name: "Product 9"
  },
]

const departments = [
  {
    id: "department-1",
    name: "Department 1",
    products: ["product-1"]
  },
  {
    id: "department-2",
    name: "Department 2",
    products: ["product-2"]
  },
  {
    id: "department-3",
    name: "Department 3",
    products: ["product-3"]
  },
  {
    id: "department-4",
    name: "Department 4",
    products: ["product-4"]
  },
  {
    id: "department-5",
    name: "Department 5",
    products: ["product-5"]
  },
  {
    id: "department-6",
    name: "Department 6",
    products: ["product-6"]
  },
  {
    id: "department-7",
    name: "Department 7",
    products: ["product-7"]
  },
  {
    id: "department-8",
    name: "Department 8",
    products: ["product-8"]
  },
  {
    id: "department-9",
    name: "Department 9",
    products: ["product-9"]
  },
];


const typeDefs = `

type Query {
    shops: [Shop]!
    expensiveShops: [Shop]!
}

type Shop {
    id: ID!
    name: String!
    departments: [Department]!
    expensiveDepartments: [Department]!
}

type Department {
    id: ID!
    name: String!
    products: [Product]!
    expensiveProducts: [Product]!
}

type Product {
    id: ID!
    name: String!
}
`;

let departmentBatchCalls = 0;
function departmentsForShopBatch(shopIds) {
  departmentBatchCalls++;
  console.log('get departments for shop ids: ' + shopIds);
  const resolvedShops = [];
  for (shopId of shopIds) {
    let shop = shops.find(shop => shop.id == shopId);
    if (!shop) {
      shop = expensiveShops.find(shop => shop.id == shopId);
    }
    resolvedShops.push(shop);
  }
  const result = [];
  for (shop of resolvedShops) {
    const resolvedDepartments = [];
    for (departmentId of shop.departments) {
      const department = departments.find(department => department.id == departmentId);
      resolvedDepartments.push(department);
    }
    result.push(resolvedDepartments);
  }
  return Promise.resolve(result);
}
let productsBatchCalls = 0;
function productsForDepartmentsBatch(departmentIds) {
  console.log('get products for department ids: ' + departmentIds);
  productsBatchCalls++;
  const result = [];
  for (departmentId of departmentIds) {
    const department = departments.find(department => department.id == departmentId);
    const resolvedProducts = [];
    for (productId of department.products) {
      resolvedProducts.push(products.find(product => product.id == productId));
    }
    result.push(resolvedProducts);
  }
  return Promise.resolve(result);
}

function shopResolver() {
  return shops;
}
function expensiveShopsResolver() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(expensiveShops), 500);
  });
  // return expensiveShops;
}
const resolvers = {
  Query: {
    shops: shopResolver,
    expensiveShops: expensiveShopsResolver
  },
  Shop: {
    departments: (source) => departmentsForShopDataLoader.load(source.id),
    expensiveDepartments: (source) => departmentsForShopDataLoader.load(source.id)
  },
  Department: {
    products: (source) => productsForDepartmentDataLoader.load(source.id),
    expensiveProducts: (source) => productsForDepartmentDataLoader.load(source.id)
  }
};


const query = `
query { 
  shops { 
      name 
      departments { 
          name 
          products { 
              name 
          } 
          expensiveProducts { 
              name 
          } 
      } 
      expensiveDepartments { 
          name 
          products { 
              name 
          } 
          expensiveProducts { 
              name 
          } 
      } 
  } 
  expensiveShops { 
      name 
      departments { 
          name 
          products { 
              name 
          } 
          expensiveProducts { 
              name 
          } 
      } 
      expensiveDepartments { 
          name 
          products { 
              name 
          } 
          expensiveProducts { 
              name 
          } 
      } 
  } 
}`

const expectedData = {
  shops: [{
    name: "Shop 1",
    departments:
      [{ name: "Department 1", products: [{ name: "Product 1" }], expensiveProducts: [{ name: "Product 1" }] },
      { name: "Department 2", products: [{ name: "Product 2" }], expensiveProducts: [{ name: "Product 2" }] },
      { name: "Department 3", products: [{ name: "Product 3" }], expensiveProducts: [{ name: "Product 3" }] }],
    expensiveDepartments:
      [{ name: "Department 1", products: [{ name: "Product 1" }], expensiveProducts: [{ name: "Product 1" }] },
      { name: "Department 2", products: [{ name: "Product 2" }], expensiveProducts: [{ name: "Product 2" }] },
      { name: "Department 3", products: [{ name: "Product 3" }], expensiveProducts: [{ name: "Product 3" }] }]
  },
  {
    name: "Shop 2",
    departments:
      [{ name: "Department 4", products: [{ name: "Product 4" }], expensiveProducts: [{ name: "Product 4" }] },
      { name: "Department 5", products: [{ name: "Product 5" }], expensiveProducts: [{ name: "Product 5" }] },
      { name: "Department 6", products: [{ name: "Product 6" }], expensiveProducts: [{ name: "Product 6" }] }
      ],
    expensiveDepartments: [
      { name: "Department 4", products: [{ name: "Product 4" }], expensiveProducts: [{ name: "Product 4" }] },
      { name: "Department 5", products: [{ name: "Product 5" }], expensiveProducts: [{ name: "Product 5" }] },
      { name: "Department 6", products: [{ name: "Product 6" }], expensiveProducts: [{ name: "Product 6" }] }
    ]
  },
  {
    name: "Shop 3",
    departments: [
      { name: "Department 7", products: [{ name: "Product 7" }], expensiveProducts: [{ name: "Product 7" }] },
      { name: "Department 8", products: [{ name: "Product 8" }], expensiveProducts: [{ name: "Product 8" }] },
      { name: "Department 9", products: [{ name: "Product 9" }], expensiveProducts: [{ name: "Product 9" }] }
    ],
    expensiveDepartments: [
      { name: "Department 7", products: [{ name: "Product 7" }], expensiveProducts: [{ name: "Product 7" }] },
      { name: "Department 8", products: [{ name: "Product 8" }], expensiveProducts: [{ name: "Product 8" }] },
      { name: "Department 9", products: [{ name: "Product 9" }], expensiveProducts: [{ name: "Product 9" }] }
    ]
  }],
  expensiveShops: [{
    name: "ExShop 1",
    departments:
      [{ name: "Department 1", products: [{ name: "Product 1" }], expensiveProducts: [{ name: "Product 1" }] },
      { name: "Department 2", products: [{ name: "Product 2" }], expensiveProducts: [{ name: "Product 2" }] },
      { name: "Department 3", products: [{ name: "Product 3" }], expensiveProducts: [{ name: "Product 3" }] }],
    expensiveDepartments:
      [{ name: "Department 1", products: [{ name: "Product 1" }], expensiveProducts: [{ name: "Product 1" }] },
      { name: "Department 2", products: [{ name: "Product 2" }], expensiveProducts: [{ name: "Product 2" }] },
      { name: "Department 3", products: [{ name: "Product 3" }], expensiveProducts: [{ name: "Product 3" }] }]
  },
  {
    name: "ExShop 2",
    departments:
      [{ name: "Department 4", products: [{ name: "Product 4" }], expensiveProducts: [{ name: "Product 4" }] },
      { name: "Department 5", products: [{ name: "Product 5" }], expensiveProducts: [{ name: "Product 5" }] },
      { name: "Department 6", products: [{ name: "Product 6" }], expensiveProducts: [{ name: "Product 6" }] }
      ],
    expensiveDepartments:
      [{ name: "Department 4", products: [{ name: "Product 4" }], expensiveProducts: [{ name: "Product 4" }] },
      { name: "Department 5", products: [{ name: "Product 5" }], expensiveProducts: [{ name: "Product 5" }] },
      { name: "Department 6", products: [{ name: "Product 6" }], expensiveProducts: [{ name: "Product 6" }] }
      ]
  },
  {
    name: "ExShop 3",
    departments:
      [{ name: "Department 7", products: [{ name: "Product 7" }], expensiveProducts: [{ name: "Product 7" }] },
      { name: "Department 8", products: [{ name: "Product 8" }], expensiveProducts: [{ name: "Product 8" }] },
      { name: "Department 9", products: [{ name: "Product 9" }], expensiveProducts: [{ name: "Product 9" }] }
      ],
    expensiveDepartments:
      [{ name: "Department 7", products: [{ name: "Product 7" }], expensiveProducts: [{ name: "Product 7" }] },
      { name: "Department 8", products: [{ name: "Product 8" }], expensiveProducts: [{ name: "Product 8" }] },
      { name: "Department 9", products: [{ name: "Product 9" }], expensiveProducts: [{ name: "Product 9" }] }
      ]
  }]
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});


graphql(schema, query, null).then((response) => {
  console.log('expected result: ' + _.isEqual(response.data, expectedData));
  console.log('departmentBatchCalls: ' + departmentBatchCalls);
  console.log('productsBatchCalls: ' + productsBatchCalls);
});