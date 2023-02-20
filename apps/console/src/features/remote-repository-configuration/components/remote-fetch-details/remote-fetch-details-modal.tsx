/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { AlertLevels, IdentifiableComponentInterface } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import { CodeEditor, Hint, LinkButton, PrimaryButton, SegmentedAccordion } from "@wso2is/react-components";
import { AxiosResponse } from "axios";
import moment from "moment";
import React, { FunctionComponent, ReactElement, SyntheticEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Grid, Icon, Modal } from "semantic-ui-react";
import {
    InterfaceConfigDetails,
    InterfaceRemoteConfigDetails,
    InterfaceRemoteFetchStatus,
    getConfigDeploymentDetails,
    triggerConfigDeployment
} from "../../../remote-repository-configuration";

/**
 * Remote fetch details props interface.
 */
interface RemoteFetchDetailsPropsInterface extends IdentifiableComponentInterface {
    isOpen?: boolean;
    onClose?: () => void;
    remoteDeployment: InterfaceRemoteConfigDetails;
}

/**
 * Remote fetch details modal.
 *
 * @param {RemoteFetchDetailsPropsInterface} props - Props injected to the component.
 * @return {React.ReactElement}
 */
export const RemoteFetchDetails: FunctionComponent<RemoteFetchDetailsPropsInterface> = (
    props: RemoteFetchDetailsPropsInterface
): ReactElement => {

    const {
        isOpen,
        onClose,
        remoteDeployment,
        [ "data-componentid" ]: componentId
    } = props;

    const dispatch = useDispatch();

    const { t } = useTranslation();

    const [ activeIndex, setActiveIndex ] = useState<number[]>([]);
    const [ deploymentStatus, setDeploymentStatus ] = useState<InterfaceConfigDetails>(undefined);
    const [ isSubmitting, setIsSubmitting ] = useState<boolean>(false);

    useEffect(() => {
        getConfigDeploymentDetails(remoteDeployment.id)
            .then((response: AxiosResponse<InterfaceConfigDetails>) => {
                setDeploymentStatus(response.data);
            })
            .catch(() => {
                dispatch(addAlert({
                    description: t("console:manage.features.remoteFetch.notifications." +
                        "getConfigDeploymentDetails.genericError.description"),
                    level: AlertLevels.ERROR,
                    message: t("console:manage.features.remoteFetch.notifications." +
                        "getConfigDeploymentDetails.genericError.message")
                }));
            });
    }, []);

    const handleAccordionOnClick = (e: SyntheticEvent, { index }: { index: number }): void => {
        const newIndexes = [ ...activeIndex ];

        if (newIndexes.includes(index)) {
            const removingIndex = newIndexes.indexOf(index);
            newIndexes.splice(removingIndex, 1);
        } else {
            newIndexes.push(index);
        }

        setActiveIndex(newIndexes);
    };

    const getHumanizedDeployment = (date: any): string => {
        const now = moment(new Date());
        const receivedDate = moment(date);
        return "Last deployed " +   moment.duration(now.diff(receivedDate)).humanize() + " ago";
    };

    return (
        <Modal
            open={ isOpen }
            onClose={ onClose }
            dimmer="blurring"
            size="small"
            className="wizard"
            data-componentid={ `${ componentId }-modal` }
        >
            <Modal.Header className="wizard-header">
                { t("console:manage.features.remoteFetch.modal.appStatusModal.heading") }
                <Hint icon="linkify" className="mt-0 mb-1">
                    { remoteDeployment?.repositoryManagerAttributes?.uri }
                </Hint>
            </Modal.Header>
            <Modal.Content
                scrolling
            >
                <Grid className="wizard-summary" data-componentid={ componentId }>
                    <Grid.Row>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 16 } textAlign="center">
                        <SegmentedAccordion
                            fluid
                            data-componentid={ componentId }
                        >
                            {
                                deploymentStatus && deploymentStatus?.remoteFetchRevisionStatuses.length > 0 &&
                                    deploymentStatus?.remoteFetchRevisionStatuses.map((
                                        value: InterfaceRemoteFetchStatus, index: number
                                    ) => (
                                        value.deployedStatus === "FAIL" &&
                                        <>
                                            <SegmentedAccordion.Title
                                                id={ value.itemName }
                                                key={ index }
                                                data-componentid={ `${ componentId }-title` }
                                                active={ activeIndex.includes(index) }
                                                index={ index }
                                                onClick={ handleAccordionOnClick }
                                                content={ (
                                                    <div className="floated left text-left">
                                                        <Icon.Group className="mr-2" size="large">
                                                            <Icon name="fork" />
                                                            <Icon
                                                                color="red"
                                                                corner="bottom right"
                                                                name="cancel"
                                                            />
                                                        </Icon.Group>
                                                        { value.itemName }
                                                        <Hint icon="info circle" className="mt-1 mb-1">
                                                            { getHumanizedDeployment(value.deployedTime) }
                                                        </Hint>
                                                    </div>
                                                ) }
                                                hideChevron={ false }
                                            />
                                            <SegmentedAccordion.Content
                                                active={ activeIndex.includes(index) }
                                                data-componentid={ `${ componentId }-content` }
                                            >
                                                <CodeEditor
                                                    className="text-left"
                                                    lint
                                                    language="htmlmixed"
                                                    sourceCode={ value.deploymentErrorReport }
                                                    options={ {
                                                        lineWrapping: true
                                                    } }
                                                    readOnly={ true }
                                                    theme={ "dark" }
                                                />
                                            </SegmentedAccordion.Content>
                                        </>
                                    ))
                            }
                        </SegmentedAccordion>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Modal.Content>
            <Modal.Actions>
                <Grid>
                    <Grid.Row column={ 1 }>
                        <Grid.Column mobile={ 8 } tablet={ 8 } computer={ 8 }>
                            <LinkButton floated="left" onClick={ () => onClose() }>
                                { t("common:close") }
                            </LinkButton>
                        </Grid.Column>
                        <Grid.Column mobile={ 8 } tablet={ 8 } computer={ 8 }>
                            <PrimaryButton
                                floated="right"
                                data-componentid={ `${ componentId }-import-button` }
                                loading={ isSubmitting }
                                disabled={ isSubmitting }
                                onClick={ () => {
                                    setIsSubmitting(true);

                                    triggerConfigDeployment(remoteDeployment.id)
                                        .then(() => {
                                            dispatch(addAlert({
                                                description: t("console:manage.features.remoteFetch.notifications" +
                                                    ".triggerConfigDeployment.success.description"),
                                                level: AlertLevels.SUCCESS,
                                                message: t("console:manage.features.remoteFetch.notifications" +
                                                    ".triggerConfigDeployment.success.message")
                                            }));
                                        })
                                        .catch(() => {
                                            dispatch(addAlert({
                                                description: t("console:manage.features.remoteFetch.notifications" +
                                                    ".triggerConfigDeployment.genericError.description"),
                                                level: AlertLevels.ERROR,
                                                message: t("console:manage.features.remoteFetch.notifications" +
                                                    ".triggerConfigDeployment.genericError.message")
                                            }));
                                        })
                                        .finally(() => {
                                            setIsSubmitting(false);
                                        });
                                } }
                            >
                                { t("console:manage.features.remoteFetch.modal.appStatusModal.primaryButton") }
                            </PrimaryButton>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Modal.Actions>
        </Modal>
    );
};
