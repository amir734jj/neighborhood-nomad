import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {JourneyForm, useCanEditJourney} from "../common";
import {deleteJourney, getJourneyById, updateJourneyById} from "../../../api";
import {ButtonGroup, Spinner} from "react-bootstrap";
import {LoadingSimpleButton, NotAuthorize} from "../../common";
import {getCompiledPath, pages} from "../../../data";

export const EditJourney = () => {
  const {journeyId} = useParams();
  const [journey, setJourney] = useState(null);
  const [fetchFailed, setFetchFailed] = useState(null);
  const navigate = useNavigate();

  const canEditJourney = useCanEditJourney();

  useEffect(() => {
    getJourneyById(journeyId).then(({ data }) => {
      setJourney(data);
    }).catch((err) => {
      setFetchFailed(err);
    });
  }, [journeyId]);

  const onSubmit = async (formValues) => {
    await updateJourneyById(journeyId, formValues);
  };

  const onDelete = async () => {
    await deleteJourney(journeyId);
    navigate(getCompiledPath(pages.journey.root));
  };

  if (fetchFailed) {
    navigate(pages.root);
    return null;
  }

  if (!journey) {
    return <Spinner />;
  }

  if (!canEditJourney(journey)) {
    return <NotAuthorize />;
  }

  return (
    <JourneyForm
      defaultValues={journey}
      renderSubmit={SubmitForm} />
  );

  function SubmitForm(handleSubmit) {
    return <ButtonGroup>
      <LoadingSimpleButton className="btn-success me-1" onClick={() => handleSubmit(onSubmit)()}>
        Update
      </LoadingSimpleButton>
      <LoadingSimpleButton className="btn-danger" onClick={onDelete}>
        Delete
      </LoadingSimpleButton>
    </ButtonGroup>;
  }
};
