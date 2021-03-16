/**
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { TestableComponentInterface } from "@wso2is/core/models";
import { Field, FormField, Forms, useTrigger } from "@wso2is/forms";
import { GenericIcon, MessageInfo } from "@wso2is/react-components";
import { equal } from "assert";
import QRCode from "qrcode.react";
import React, { PropsWithChildren, useEffect, useState, useRef } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Button, Divider, Grid, Icon, List, Message, Modal, Popup, Segment, Form, FormProps, Container, Table } from "semantic-ui-react";
import { initTOTPCode, refreshTOTPCode, validateTOTPCode } from "../../../api";
import { getMFAIcons, getQRCodeScanIcon } from "../../../configs";
import { AlertInterface, AlertLevels } from "../../../models";
import { AppState } from "../../../store";

/**
 * Property types for the TOTP component.
 * Also see {@link TOTPAuthenticator.defaultProps}
 */
interface TOTPProps extends TestableComponentInterface {
    onAlertFired: (alert: AlertInterface) => void;
}

/**
 * TOTP Authenticator.
 *
 * @param {React.PropsWithChildren<TOTPProps>} props - Props injected to the component.
 * @return {React.ReactElement}
 */
export const TOTPAuthenticator: React.FunctionComponent<TOTPProps> = (
    props: PropsWithChildren<TOTPProps>
): React.ReactElement => {

    const {
        onAlertFired,
        [ "data-testid" ]: testId
    } = props;

    const [ openWizard, setOpenWizard ] = useState(false);
    const [ qrCode, setQrCode ] = useState("");
    const [ step, setStep ] = useState(0);
    const [ error, setError ] = useState(false);

    const [ submit, setSubmit ] = useTrigger();

    const { t } = useTranslation();

    const totpConfig = useSelector((state: AppState) => state?.config?.ui?.authenticatorApp);

    const translateKey = "myAccount:components.mfa.authenticatorApp.";

    const pinCode1 = useRef<HTMLInputElement>();
    const pinCode2 = useRef<HTMLInputElement>();
    const pinCode3 = useRef<HTMLInputElement>();
    const pinCode4 = useRef<HTMLInputElement>();
    const pinCode5 = useRef<HTMLInputElement>();
    const pinCode6 = useRef<HTMLInputElement>();

    const [pinCode2PastValue, setPinCode2PastValue] = useState<string>(null);
    const [pinCode3PastValue, setPinCode3PastValue] = useState<string>(null);
    const [pinCode4PastValue, setPinCode4PastValue] = useState<string>(null);
    const [pinCode5PastValue, setPinCode5PastValue] = useState<string>(null);
    const [pinCode6PastValue, setPinCode6PastValue] = useState<string>(null);

    /**
     * Reset error and step when the modal is closed
     */
    useEffect(() => {
        if (!openWizard) {
            setError(false);
            setStep(0);
        }
    }, [ openWizard ]);

    /**
     * Makes an API call to verify the code entered by the user
     * @param code The code entered by the user
     */
    const verifyCode = (code: string) => {
        validateTOTPCode(code).then((response) => {
            if (response.data.isValid) {
                setStep(1);
            } else {
                setError(true);
            }
        }).catch(() => {
            setError(true);
        });
    };

    /**
     * Initiates the TOTP flow by getting QR code URL
     */
    const initTOTPFlow = () => {
        setStep(0);
        initTOTPCode().then((response) => {
            const qrCodeUrl = window.atob(response.data.qrCodeUrl);
            setQrCode(qrCodeUrl);
            setOpenWizard(true);
        }).catch((errorMessage) => {
            onAlertFired({
                description: t(translateKey + "notifications.initError.error.description", {
                    error: errorMessage
                }),
                level: AlertLevels.ERROR,
                message: t(translateKey + "notifications.initError.error.message")
            });
        });
    };

    /**
     * Refreshes the QR code
     */
    const refreshCode = () => {
        refreshTOTPCode().then((response) => {
            const qrCodeUrl = window.atob(response.data.qrCodeUrl);
            setQrCode(qrCodeUrl);
        }).catch((errorMessage) => {
            onAlertFired({
                description: t(translateKey + "notifications.initError.error.description", {
                    error: errorMessage
                }),
                level: AlertLevels.ERROR,
                message: t(translateKey + "notifications.initError.error.message")
            });
        });
    };

    const handleTOTPVerificationCodeSubmit = (event: React.FormEvent<HTMLFormElement> ) =>{

        let verificationCode =  event.target[0].value;
        for (let pinCodeIndex = 1;pinCodeIndex<6;pinCodeIndex++){
            verificationCode = verificationCode + event.target[pinCodeIndex].value;
        }

        verifyCode(verificationCode);
    }


    /**
     * Scrolls to the first field that throws an error.
     *
     * @param {string} field The name of the field.
     */
    const focusInToNextPinCode = (field: string): void => {
        
        switch (field) {
            case "pincode-1":
                pinCode2.current.focus();
                break;
            case "pincode-2":
                pinCode3.current.focus();
                break;
            case "pincode-3":
                pinCode4.current.focus();
                break;
            case "pincode-4":
                    pinCode5.current.focus();
                    break;
            case "pincode-5":
                pinCode6.current.focus();
                break;
        }

    };

    /**
     * Scrolls to the first field that throws an error.
     *
     * @param {string} field The name of the field.
     */
         const focusInToPreviousPinCode = (field: string): void => {
        
            switch (field) {
                case "pincode-2":
                    pinCode1.current.value = "";
                    pinCode1.current.focus();
                    break;
                case "pincode-3":
                    pinCode2.current.value = "";
                    pinCode2.current.focus();
                    break;
                case "pincode-4":
                    pinCode3.current.value = "";
                    pinCode3.current.focus();
                    break;
                case "pincode-5":
                    pinCode4.current.value = "";
                    pinCode4.current.focus();
                    break;
                case "pincode-6":
                    pinCode5.current.value = "";
                    pinCode5.current.focus();
                    break;
            }
    
        };

    /**
     * This renders the QR code page
     */
    const renderQRCode = (step: number): JSX.Element => {
        return (
            <Segment basic >
                {/* <div className="stepper"> */}
                    {/* <div className="step-number">1</div> */}
                    <h5 className=" text-center" > Scan the QR code below using an anthenticator app.</h5>

                    {/* <div className="step-text"> */}
                        {/* <h5 >{ t(translateKey + "modals.scan.heading") }</h5> */}
                        <Segment textAlign="center" basic className="qr-code">
                            <QRCode value={ qrCode } data-testid={ `${ testId }-modals-scan-qrcode`}/>
                            <Divider hidden />
                            <p className="link" onClick={ refreshCode } 
                            data-testid={ `${ testId }-modals-scan-generate`}>
                                { t(translateKey + "modals.scan.generate") }
                            </p>
                        </Segment>
                        { totpConfig?.length > 0
                            ? (
                                <Message info>
                                    <Message.Header>{ t(translateKey + "modals.scan.messageHeading") }</Message.Header>
                                    <Message.Content>
                                        { t(translateKey + "modals.scan.messageBody") + " " }
                                        <List bulleted>
                                            { totpConfig?.map((app, index) => (
                                                <List.Item key={ index } >
                                                    <a
                                                        target="_blank"
                                                        href={ app.link }
                                                        rel="noopener noreferrer"
                                                    >
                                                        { app.name }
                                                    </a>
                                                </List.Item>
                                            )) }
                                        </List>
                                    </Message.Content>
                                </Message>
                            )
                            : null }
                        <h5 className=" text-center" > Enter the generated code to verify </h5>

                        <Segment basic className="pl-0">
                        {
                            error
                                ? (
                                
                                    <Message 
                                        error data-testid={ `${ testId }-code-verification-form-field-error` }>
                                            
                                        { t(translateKey + "modals.verify.error") }
                                    </Message>
                                    
                                )
                                : null
                        }
<Form onSubmit={ (event: React.FormEvent<HTMLFormElement>, data: FormProps): void => {
                (handleTOTPVerificationCodeSubmit(event));
            } }>
<Container>
    <Grid>
        <Grid.Row textAlign="center" centered columns={ 6 } >
                
                <Grid.Column >
                    <Form.Field>
                        <input autoFocus ref= { pinCode1 }name="pincode-1" placeholder="." className="text-center" type='text' maxLength={1} 
                        onChange= { (event) => {
                            if (event.target.value.length !==0){
                                focusInToNextPinCode("pincode-1");
                            }
                        }}/>
                    </Form.Field>
                </Grid.Column>
                <Grid.Column >
                    <Form.Field>
                        <input ref= { pinCode2 } name="pincode-2" placeholder="." className="text-center" type='text' maxLength={1} 
                        onChange= { (event) => {
                            if (event.target.value.length !==0){
                                setPinCode2PastValue[event.target.value];
                                focusInToNextPinCode("pincode-2");
                            }else {
                                if (pinCode2PastValue != null && pinCode2PastValue.length == 0)  {
                                    focusInToPreviousPinCode("pincode-2");
                                }
                                setPinCode2PastValue[event.target.value];
                            }
                        }}/>
                    </Form.Field>
                </Grid.Column>
                <Grid.Column >
                    <Form.Field >
                        <input ref= { pinCode3 } name="pincode-3" placeholder="." className="text-center" type='text' maxLength={1} 
                        onChange= { (event) => {
                            if (event.target.value.length !==0){
                                setPinCode3PastValue[event.target.value];
                                focusInToNextPinCode("pincode-3");
                            }else {
                                if (pinCode3PastValue != null && pinCode3PastValue.length == 0)  {
                                    focusInToPreviousPinCode("pincode-3");
                                }
                                setPinCode3PastValue[event.target.value];
                            }
                        }}/>
                    </Form.Field>
                </Grid.Column>
                <Grid.Column>
                    <Form.Field>
                        <input ref= { pinCode4 } name="pincode-4" placeholder="." className="text-center" type='text' maxLength={1} 
                        onChange= { (event) => {
                            if (event.target.value.length !==0){
                                setPinCode4PastValue[event.target.value];
                                focusInToNextPinCode("pincode-4");
                            }else {
                                if (pinCode4PastValue != null && pinCode4PastValue.length == 0)  {
                                    focusInToPreviousPinCode("pincode-4");
                                }
                                setPinCode4PastValue[event.target.value];
                            }
                        }}/>
                    </Form.Field>
                </Grid.Column>
                <Grid.Column >
                    <Form.Field>
                        <input ref= { pinCode5 } name="pincode-5" placeholder="." className="text-center" type='text' maxLength={1} 
                        // onChange= { (event) => {
                        //     if (event.target.value.length !==0){
                        //         setPinCode5PastValue[event.target.value];
                        //         focusInToNextPinCode("pincode-5");
                        //     } else {
                        //         if (pinCode5PastValue != null && pinCode5PastValue.length == 0)  {
                        //             focusInToPreviousPinCode("pincode-5");
                        //         }
                        //         setPinCode5PastValue[event.target.value];
                        //     }
                        // }}
                        
                        onKeyUp= { (event) => {
                            if ((event.key === "Backspace") || (event.key === "Delete")){
                                focusInToPreviousPinCode("pincode-5");
                                // setPinCode5PastValue[event.key];
                                // focusInToNextPinCode("pincode-5");
                            } else {
                                focusInToNextPinCode("pincode-5");

                                // if (pinCode5PastValue != null && pinCode5PastValue.length == 0)  {
                                //     focusInToPreviousPinCode("pincode-5");
                                // }
                                // setPinCode5PastValue[event.target.value];
                            }
                        }}/>
                    </Form.Field>
                </Grid.Column>
                <Grid.Column >
                    <Form.Field>
                        <input ref= { pinCode6 } name="pincode-6" placeholder="." className="text-center" type='text' maxLength={1} 
                        // onChange= { (event) => {

                        //     if (event.target.value.length !==0){
                        //         setPinCode6PastValue[event.target.value];
                        //     } 
                        // }}
                        onKeyUp={ (event)=> {
                            console.log(pinCode6PastValue);
                            if (event.key === "Backspace"){
                                if (pinCode6PastValue === "Backspace") {
                                    console.log("focusInToPreviousPinCode");
                                    focusInToPreviousPinCode("pincode-6");
                                }
                            } 
                            setPinCode6PastValue[event.key];
                            console.log(pinCode6PastValue);

                        }}/>
                    </Form.Field>
                    </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={ 1 }>
            <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 16 }>
                <Button
                    primary
                    type="submit"
                    className=" totp-verify-action-button"
                    data-testid={ `${ testId }-modal-actions-primary-button`}
                >
                    { stepButtonText(step) }
                </Button>
            </Grid.Column>
        </Grid.Row>
        {
            step !== 1
                ? (
                    <Grid.Row columns={ 1 }>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 16 }>
                            < Button onClick={ () => { setOpenWizard(false); } } className="link-button totp-verify-action-button"
                            data-testid={ `${ testId }-modal-actions-cancel-button`}>
                            { t("common:cancel") }
                            </Button>
                        </Grid.Column>
                    </Grid.Row>
                )
                : null
                }
    </Grid>
</Container>
</Form>
                        </Segment>
            </Segment>
        );
    };

    /**
     * This renders the success message at the end of the TOTP flow
     */
    const renderSuccess = (): JSX.Element => {
        return (
            <Segment basic textAlign="center">
                <div className="svg-box">
                    <svg className="circular positive-stroke">
                        <circle
                            className="path"
                            cx="75"
                            cy="75"
                            r="50"
                            fill="none"
                            strokeWidth="5"
                            strokeMiterlimit="10"
                        />
                    </svg>
                    <svg className="positive-icon positive-stroke">
                        <g transform="matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-489.57,-205.679)">
                            <path
                                className="positive-icon__check"
                                fill="none"
                                d="M616.306,283.025L634.087,300.805L673.361,261.53"
                            />
                        </g>
                    </svg>
                </div>
                <p>{ t(translateKey + "modals.done") }</p>
            </Segment>
        );
    };

    /**
     * Generates content based on the input step
     * @param stepToDisplay The step number
     */
    const stepContent = (stepToDisplay: number): JSX.Element => {
        switch (stepToDisplay) {
            case 0:
                return renderQRCode(stepToDisplay);
            case 1:
                return renderSuccess();
        }
    };

    /**
     * Generates button text based on the input step
     * @param stepToDisplay The step number
     */
    const stepButtonText = (stepToDisplay: number): string => {
        switch (stepToDisplay) {
            case 0:
                return t("common:verify");
            case 1:
                return t("common:done");
        }
    };

    /**
     * Generates the right button-click event based on the input step number
     * @param stepToStep The step number
     */
    const handleModalButtonClick = (stepToStep: number) => {
        switch (stepToStep) {
            case 0:
                setSubmit();
                break;
            case 1:
                setOpenWizard(false);
                break;
        }
    };

    /**
     * This renders the TOTP wizard
     */
    const totpWizard = (): JSX.Element => {
        return (
            <Modal
                data-testid={ `${ testId }-modal` }
                dimmer="blurring"
                size="tiny"
                open={ openWizard }
                onClose={ () => { setOpenWizard(false); } }
                className="totp"
            >
                {
                    step !== 3
                        ? (
                            < Modal.Header className="wizard-header text-center">
                                Set Up An Authenticator App
                            </Modal.Header>
                        )
                        : null
                }
                <Modal.Content data-testid={ `${ testId }-modal-content` } scrolling>
                    { stepContent(step) }
                </Modal.Content>
                <Modal.Actions data-testid={ `${ testId }-modal-actions` }>
                    {
                        step === 0
                            ? (
                        <Message info className="text-left grey display-flex">      
                        <Icon name="info circle" />
                        <Message.Content
                        className="message-content " > 
                            
                                    Don&apos;t have an app? Download an authenticator application like Google Authenticator from
                                    <a href="https://www.apple.com/us/search/totp?src=globalnav"> App Store </a> or
                                        <a href="https://play.google.com/store/search?q=totp"> Google Play </a>
                        </Message.Content>
                        </Message>  
                            )
                            : (  
                            <Button
                            primary
                            data-testid={ `${ testId }-modal-actions-primary-button`}
                            onClick= { () => { handleModalButtonClick(step);}}
                        >
                            { stepButtonText(step) }
                        </Button>
                        )
                    }
                </Modal.Actions>

            </Modal>
        );
    };

    return (
        <>
            { totpWizard() }
            <Grid padded={ true } data-testid={ testId }>
                <Grid.Row columns={ 2 }>
                    <Grid.Column width={ 11 } className="first-column">
                        <List.Content floated="left">
                            <GenericIcon
                                icon={ getMFAIcons().authenticatorApp }
                                size="mini"
                                twoTone={ true }
                                transparent={ true }
                                square={ true }
                                rounded={ true }
                                relaxed={ true }
                            />
                        </List.Content>
                        <List.Content>
                            <List.Header>
                                { t(translateKey + "heading") }
                            </List.Header>
                            <List.Description>
                                { t(translateKey + "description") }
                            </List.Description>
                        </List.Content>
                    </Grid.Column>
                    <Grid.Column width={ 5 } className="last-column">
                        <List.Content floated="right">
                            <Popup
                                trigger={
                                    (
                                        <Icon
                                            link={ true }
                                            onClick={ initTOTPFlow }
                                            className="list-icon"
                                            size="small"
                                            color="grey"
                                            name="eye"
                                            data-testid={`${testId}-view-button`}
                                        />
                                    )
                                }
                                content={ t(translateKey + "hint") }
                                inverted
                            />
                        </List.Content>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </>
    );
};

/**
 * Default properties for {@link TOTPAuthenticator}
 * See type definitions in {@link TOTPProps}
 */
TOTPAuthenticator.defaultProps = {
    "data-testid": "totp-authenticator"
};
