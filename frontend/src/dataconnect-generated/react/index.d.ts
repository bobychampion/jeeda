import { CreateUserData, ListProductsData, UpdateProductData, UpdateProductVariables, ListAssemblyInstructionsForProductData, ListAssemblyInstructionsForProductVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;

export function useListProducts(options?: useDataConnectQueryOptions<ListProductsData>): UseDataConnectQueryResult<ListProductsData, undefined>;
export function useListProducts(dc: DataConnect, options?: useDataConnectQueryOptions<ListProductsData>): UseDataConnectQueryResult<ListProductsData, undefined>;

export function useUpdateProduct(options?: useDataConnectMutationOptions<UpdateProductData, FirebaseError, UpdateProductVariables>): UseDataConnectMutationResult<UpdateProductData, UpdateProductVariables>;
export function useUpdateProduct(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateProductData, FirebaseError, UpdateProductVariables>): UseDataConnectMutationResult<UpdateProductData, UpdateProductVariables>;

export function useListAssemblyInstructionsForProduct(vars: ListAssemblyInstructionsForProductVariables, options?: useDataConnectQueryOptions<ListAssemblyInstructionsForProductData>): UseDataConnectQueryResult<ListAssemblyInstructionsForProductData, ListAssemblyInstructionsForProductVariables>;
export function useListAssemblyInstructionsForProduct(dc: DataConnect, vars: ListAssemblyInstructionsForProductVariables, options?: useDataConnectQueryOptions<ListAssemblyInstructionsForProductData>): UseDataConnectQueryResult<ListAssemblyInstructionsForProductData, ListAssemblyInstructionsForProductVariables>;
