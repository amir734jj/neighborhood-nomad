import React from "react";
import {useNavigate} from "react-router-dom";
import {getEmptyJourney, JourneyForm} from "../common";
import {getCompiledPath, pages} from "../../../data";
import {submitJourney} from "../../../api";
import {LoadingSimpleButton} from "../../common";

export const AddJourney = () => {
  const navigate = useNavigate();

  const onSubmit = async formValues => {
    const {data: journey} = await submitJourney(formValues);
    navigate(getCompiledPath(pages.journey.byId.view, {journeyId: journey.id}));
  };

  return (
    <JourneyForm
      defaultValues={getEmptyJourney()}
      renderSubmit={SubmitForm}
    />
  );

  function SubmitForm(handleSubmit) {
    return <LoadingSimpleButton className="btn-success" wide onClick={handleSubmit(onSubmit)}>
      Submit Journey
    </LoadingSimpleButton>;
  }
};