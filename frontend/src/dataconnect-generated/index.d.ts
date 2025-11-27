import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AssemblyInstruction_Key {
  id: UUIDString;
  __typename?: 'AssemblyInstruction_Key';
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface ListAssemblyInstructionsForProductData {
  assemblyInstructions: ({
    id: UUIDString;
    title: string;
    description: string;
    imageUrl: string;
    stepNumber: number;
    videoUrl?: string | null;
  } & AssemblyInstruction_Key)[];
}

export interface ListAssemblyInstructionsForProductVariables {
  productId: UUIDString;
}

export interface ListProductsData {
  products: ({
    id: UUIDString;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
  } & Product_Key)[];
}

export interface OrderItem_Key {
  orderId: UUIDString;
  productId: UUIDString;
  __typename?: 'OrderItem_Key';
}

export interface Order_Key {
  id: UUIDString;
  __typename?: 'Order_Key';
}

export interface Product_Key {
  id: UUIDString;
  __typename?: 'Product_Key';
}

export interface UpdateProductData {
  product_update?: Product_Key | null;
}

export interface UpdateProductVariables {
  id: UUIDString;
  price: number;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(): MutationPromise<CreateUserData, undefined>;
export function createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface ListProductsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProductsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListProductsData, undefined>;
  operationName: string;
}
export const listProductsRef: ListProductsRef;

export function listProducts(): QueryPromise<ListProductsData, undefined>;
export function listProducts(dc: DataConnect): QueryPromise<ListProductsData, undefined>;

interface UpdateProductRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProductVariables): MutationRef<UpdateProductData, UpdateProductVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateProductVariables): MutationRef<UpdateProductData, UpdateProductVariables>;
  operationName: string;
}
export const updateProductRef: UpdateProductRef;

export function updateProduct(vars: UpdateProductVariables): MutationPromise<UpdateProductData, UpdateProductVariables>;
export function updateProduct(dc: DataConnect, vars: UpdateProductVariables): MutationPromise<UpdateProductData, UpdateProductVariables>;

interface ListAssemblyInstructionsForProductRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAssemblyInstructionsForProductVariables): QueryRef<ListAssemblyInstructionsForProductData, ListAssemblyInstructionsForProductVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListAssemblyInstructionsForProductVariables): QueryRef<ListAssemblyInstructionsForProductData, ListAssemblyInstructionsForProductVariables>;
  operationName: string;
}
export const listAssemblyInstructionsForProductRef: ListAssemblyInstructionsForProductRef;

export function listAssemblyInstructionsForProduct(vars: ListAssemblyInstructionsForProductVariables): QueryPromise<ListAssemblyInstructionsForProductData, ListAssemblyInstructionsForProductVariables>;
export function listAssemblyInstructionsForProduct(dc: DataConnect, vars: ListAssemblyInstructionsForProductVariables): QueryPromise<ListAssemblyInstructionsForProductData, ListAssemblyInstructionsForProductVariables>;

