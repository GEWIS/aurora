import {
  AuthenticateApi,
  BalanceApi,
  BannersApi,
  VouchergroupsApi,
  Configuration,
  ContainersApi,
  FilesApi,
  InvoicesApi,
  PayoutRequestsApi,
  PointofsaleApi,
  ProductCategoriesApi,
  ProductsApi,
  RbacApi,
  RootApi,
  StripeApi,
  TransactionsApi,
  TransfersApi,
  UsersApi,
  VatGroupsApi,
  DebtorsApi,
} from '@gewis/sudosos-client';
import axios, { AxiosInstance } from 'axios';

// Create an axios instance
const axiosInstance: AxiosInstance = axios.create();

export class SudoSOSClient {
  private readonly _authenticateApi: AuthenticateApi;

  private readonly _balanceApi: BalanceApi;

  private readonly _debtorsApi: DebtorsApi;

  private readonly _usersApi: UsersApi;

  private readonly _posApi: PointofsaleApi;

  private readonly _categoryApi: ProductCategoriesApi;

  private readonly _transactionApi: TransactionsApi;

  private readonly _bannerApi: BannersApi;

  private readonly _rootApi: RootApi;

  private readonly _voucherGroupApi: VouchergroupsApi;

  private readonly _containerApi: ContainersApi;

  private readonly _filesApi: FilesApi;

  private readonly _invoicesApi: InvoicesApi;

  private readonly _payoutsApi: PayoutRequestsApi;

  private readonly _productsApi: ProductsApi;

  private readonly _transfersApi: TransfersApi;

  private readonly _vatGroupsApi: VatGroupsApi;

  private readonly _stripeApi: StripeApi;

  private readonly _rbacApi: RbacApi;

  private readonly _openBannerApi: BannersApi;

  constructor(basePath: string, config?: Configuration) {
    this._authenticateApi = new AuthenticateApi(config, basePath, axiosInstance);
    this._balanceApi = new BalanceApi(config, basePath, axiosInstance);
    this._debtorsApi = new DebtorsApi(config, basePath, axiosInstance);
    this._usersApi = new UsersApi(config, basePath, axiosInstance);
    this._posApi = new PointofsaleApi(config, basePath, axiosInstance);
    this._categoryApi = new ProductCategoriesApi(config, basePath, axiosInstance);
    this._transactionApi = new TransactionsApi(config, basePath, axiosInstance);
    this._bannerApi = new BannersApi(config, basePath, axiosInstance);
    this._openBannerApi = new BannersApi(undefined, basePath, axiosInstance);
    this._rootApi = new RootApi();
    this._voucherGroupApi = new VouchergroupsApi(config, basePath, axiosInstance);
    this._containerApi = new ContainersApi(config, basePath, axiosInstance);
    this._filesApi = new FilesApi(config, basePath, axiosInstance);
    this._invoicesApi = new InvoicesApi(config, basePath, axiosInstance);
    this._payoutsApi = new PayoutRequestsApi(config, basePath, axiosInstance);
    this._productsApi = new ProductsApi(config, basePath, axiosInstance);
    this._transfersApi = new TransfersApi(config, basePath, axiosInstance);
    this._vatGroupsApi = new VatGroupsApi(config, basePath, axiosInstance);
    this._stripeApi = new StripeApi(config, basePath, axiosInstance);
    this._rbacApi = new RbacApi(config, basePath, axiosInstance);
  }

  get authenticate(): AuthenticateApi {
    return this._authenticateApi;
  }

  get balance(): BalanceApi {
    return this._balanceApi;
  }

  get debtor(): DebtorsApi {
    return this._debtorsApi;
  }

  get pos(): PointofsaleApi {
    return this._posApi;
  }

  get category(): ProductCategoriesApi {
    return this._categoryApi;
  }

  get transaction(): TransactionsApi {
    return this._transactionApi;
  }

  get banner(): BannersApi {
    return this._bannerApi;
  }

  get rootApi(): RootApi {
    return this._rootApi;
  }

  get borrelkaart(): VouchergroupsApi {
    return this._voucherGroupApi;
  }

  get container(): ContainersApi {
    return this._containerApi;
  }

  get files(): FilesApi {
    return this._filesApi;
  }

  get invoices(): InvoicesApi {
    return this._invoicesApi;
  }

  get payouts(): PayoutRequestsApi {
    return this._payoutsApi;
  }

  get products(): ProductsApi {
    return this._productsApi;
  }

  get transfers(): TransfersApi {
    return this._transfersApi;
  }

  get vatGroups(): VatGroupsApi {
    return this._vatGroupsApi;
  }

  get stripe(): StripeApi {
    return this._stripeApi;
  }

  get rbac(): RbacApi {
    return this._rbacApi;
  }

  get user(): UsersApi {
    return this._usersApi;
  }

  get openBanner(): BannersApi {
    return this._openBannerApi;
  }
}
