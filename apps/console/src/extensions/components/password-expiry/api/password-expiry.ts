/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { AsgardeoSPAClient, HttpRequestConfig } from "@asgardeo/auth-react";
import { IdentityAppsApiException } from "@wso2is/core/exceptions";
import { HttpMethods } from "@wso2is/core/models";
import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { store } from "../../../../features/core";
import useRequest, {
    RequestConfigInterface,
    RequestErrorInterface,
    RequestResultInterface
} from "../../../../features/core/hooks/use-request";
import {
    GovernanceConnectorInterface,
    UpdateGovernanceConnectorConfigInterface
} from "../../../../features/server-configurations";

/**
 * Initialize an axios Http client.
 */
const httpClient: (
    config: HttpRequestConfig
) => Promise<AxiosResponse> = AsgardeoSPAClient.getInstance().httpRequest.bind(
    AsgardeoSPAClient.getInstance()
);

export const useGetPasswordExpiryProperties = <
    Data = GovernanceConnectorInterface,
    Error = RequestErrorInterface
>(): RequestResultInterface<Data, Error> => {
    const requestConfig: RequestConfigInterface = {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        method: HttpMethods.GET,
        url: store.getState()?.config?.endpoints?.passwordExpiry
    };

    const { data, error, isValidating, mutate } = useRequest<Data, Error>(
        requestConfig
    );

    return {
        data,
        error,
        isLoading: !data && !error,
        isValidating,
        mutate
    };
};

export const updatePasswordExpiryProperties = (
    data: UpdateGovernanceConnectorConfigInterface
): Promise<any> => {
    const requestConfig: AxiosRequestConfig = {
        data,
        headers: {
            "Content-Type": "application/json"
        },
        method: HttpMethods.PATCH,
        url: store.getState()?.config?.endpoints?.passwordExpiry
    };

    return httpClient(requestConfig)
        .then((response: AxiosResponse) => {
            if (response.status !== 200) {
                throw new IdentityAppsApiException(
                    "Received an invalid status code while updating the password expiry properties.",
                    null,
                    response.status,
                    response.request,
                    response,
                    response.config
                );
            }

            return Promise.resolve(response.data);
        })
        .catch((error: AxiosError) => {
            throw new IdentityAppsApiException(
                "An error ocurred while updating the password expiry properties.",
                error.stack,
                error.code,
                error.request,
                error.response,
                error.config
            );
        });
};
