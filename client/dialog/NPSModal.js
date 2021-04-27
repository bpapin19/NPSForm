import React, { Fragment, useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { useHistory } from "react-router-dom";
import classNames from "classnames";
import { Check, X } from "react-feather";
import moment from "moment";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import { SHOULD_SHOW_NPS, GET_NEW_NPS, GET_LAST_NPS } from "Queries/Nps/NpsQueries";
import { RECORD_NPS_SCORE } from "Mutations/Nps/NpsMutations";

import get from "lodash/get";

import Snowplow from "Utils/Snowplow";
import { ActionDialog } from "Components/Dialog/ActionDialog";

// NPS form styles
const useStyles = makeStyles(theme => ({
  npsRoot: {
    borderRadius: "0px",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      margin: "0"
    }
  },
  npsContainer: {
    padding: "0"
  },
  npsTopRow: {
    display: "flex",
    position: "absolute",
    right: "5px",
    top: "5px",
    width: "100%"
  },
  npsCloseContainer: {
    alignItems: "center",
    cursor: "pointer",
    display: "flex",
    height: "30px",
    justifyContent: "space-around",
    marginLeft: "auto",
    width: "30px"
  },
  npsCloseIcon: {
    color: "#000000",
    height: "24px",
    width: "24px"
  },
  npsHeader: {
    color: "#000000",
    fontWeight: "500",
    fontSize: "28px",
    lineHeight: "42px",
    marginBottom: "25px",
    marginTop: "0"
  },
  npsHeaderConfirmation: {
    marginBottom: "75px",
    fontSize: "36px"
  },
  checkCircle: {
    alignItems: "center",
    backgroundColor: "#4cae51",
    borderRadius: "100%",
    display: "flex",
    height: "120px",
    justifyContent: "space-around",
    margin: "150px auto 75px auto",
    width: "120px"
  },
  checkIcon: {
    color: "#FFFFFF",
    height: "auto",
    width: "105px"
  },
  npsButtonRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "8px"
  },
  npsScoreButton: {
    alignItems: "center",
    borderRadius: "0",
    display: "flex",
    fontSize: "18px",
    justifyContent: "space-around",
    height: "43px",
    minWidth: "0px",
    padding: "5px 16px",
    width: "43px"
  },
  npsScoreButtonUnselected: {
    color: "#000000"
  },
  npsScoreButtonSelected: {
    backgroundColor: "rgba(252, 114, 71, 0.2)",
    color: "#fc7247"
  },
  npsScoreButtonError: {
    backgroundColor: "rgba(227, 52, 75, 0.2)",
    color: "#e3344b"
  },
  npsTextField: {
    marginTop: "32px",
    width: "100%"
  },
  npsErrorText: {
    color: "#e3344b",
    fontSize: "12px",
    marginTop: theme.spacing(3),
    opacity: 1,
    textAlign: "center",
    transition: "opacity 0.2s"
  },
  npsErrorTextHidden: {
    opacity: 0,
    pointerEvents: "none"
  },
  submitButtonContainer: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-around",
    marginTop: theme.spacing(1),
    width: "100%"
  },
  submitButton: {
    backgroundColor: "#fc7247",
    fontSize: "14px",
    height: "48px",
    width: "320px",
    "&:hover": {
      backgroundColor: "#fc7247"
    }
  }
}));

/* NPSFormContent
 * @param props.currentUserId string - snowplow param
 * @param props.onDismiss function - closes modal and triggers snowplow if NPS is ignored
 * @param props.setShowNpsConfirmation function - toggles confirmation screen
 * @param props.showNpsConfirmation boolean - are we showing the confirmation text
 * @param props.source string - snowplow param
 * @param props.updateLocalStorage function - checks and updates localstorage and npsScoreSubmitted
 *
 * @description NPS Form and Confirmation Screen
 */

const NPSFormContent = props => {
  const {
    currentUserId,
    onDismiss,
    setShowNpsConfirmation,
    showNpsConfirmation,
    source,
    updateLocalStorage
  } = props;
  const classes = useStyles();

  const [npsScore, setNpsScore] = useState(null);
  const [npsComment, setNpsComment] = useState("");
  const [npsError, setNpsError] = useState(false);

  const [recordNps, { data }] = useMutation(RECORD_NPS_SCORE);

  // nps score selected
  const updateScore = newScore => {
    if (npsError) {
      setNpsError(false);
    }
    setNpsScore(newScore);
  };

  // nps comment updated
  const updateComment = e => {
    setNpsComment(e.target.value ? e.target.value : "");
    if (!npsScore && !npsError) {
      setNpsError(true);
    }
  };

  // submit button clicked
  const submitForm = () => {
    
    if (npsScore === null) return npsError(true);

    recordNps({ variables: { input: {value: npsScore, extraText: npsComment} } })

    Snowplow.handleGenericEvent(
      // category, action, label, property, value, context
      "User Interaction",
      "Button Clicked",
      "NPS Form Submitted",
      {
        score: npsScore,
        comment: npsComment,
        source
      },
      "",
      "",
      currentUserId
    );
    // show confirmation screen
    setShowNpsConfirmation(true);
    // update local storage but don't dismiss modal yet
    updateLocalStorage(false);
  };

  // render nps score button
  const renderScoreButton = score => {
    const npsScoreButtonClassName = classNames(classes.npsScoreButton, {
      [classes.npsScoreButtonUnselected]: !npsError,
      [classes.npsScoreButtonSelected]: !npsError && npsScore === score,
      [classes.npsScoreButtonError]: npsError
    });
    return (
      <Button
        className={npsScoreButtonClassName}
        onClick={() => updateScore(score)}
        variant="outlined"
      >
        {score}
      </Button>
    );
  };

  const npsErrorTextClassName = classNames(classes.npsErrorText, {
    [classes.npsErrorTextHidden]: !npsError
  });

  const npsConfirmationHeaderClassName = classNames(
    classes.npsHeader,
    classes.npsHeaderConfirmation
  );

  // Get new NPS Question
  const { data: getNew } = useQuery(GET_NEW_NPS, { 
    fetchPolicy: "network-only"
  });

  // TODO: switch this to true if we want to show a new question from query
  let questionSwitch = false;

  let newNpsQuestion = (questionSwitch) ? get(getNew, "getNewNpsQuestion.text") : "How likely are you to recommend Hyrecar to a friend or colleague?";

  // we are showing the confirmation screen
  if (showNpsConfirmation) {
    return (
      <Fragment>
        <div className={classes.npsTopRow}>
          <div onClick={onDismiss} className={classes.npsCloseContainer}>
            <X className={classes.npsCloseIcon} />
          </div>
        </div>
        <div className={classes.checkCircle}>
          <Check className={classes.checkIcon} />
        </div>
        <Typography
          component="h4"
          variant="h4"
          align="center"
          className={npsConfirmationHeaderClassName}
        >
          Thanks for your feedback!
        </Typography>
      </Fragment>
    );
  }

  // we are showing the NPS form
  return (
    <Fragment>
      <div className={classes.npsTopRow}>
        <div onClick={onDismiss} className={classes.npsCloseContainer}>
          <X className={classes.npsCloseIcon} />
        </div>
      </div>
      <Typography
        component="h4"
        variant="h4"
        align="center"
        className={classes.npsHeader}
      >
        {newNpsQuestion}
      </Typography>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography component="p" variant="body1">
          Not likely at all
        </Typography>
        <Typography component="p" variant="body1">
          Extremely likely
        </Typography>
      </div>
      <div className={classes.npsButtonRow}>
        {renderScoreButton(1)}
        {renderScoreButton(2)}
        {renderScoreButton(3)}
        {renderScoreButton(4)}
        {renderScoreButton(5)}
        {renderScoreButton(6)}
        {renderScoreButton(7)}
        {renderScoreButton(8)}
        {renderScoreButton(9)}
        {renderScoreButton(10)}
      </div>
      <TextField
        className={classes.npsTextField}
        color="primary"
        InputLabelProps={{ shrink: true }}
        label="What is the reason for your score?"
        multiline
        onChange={updateComment}
        rows={4}
        value={npsComment}
        variant="filled"
      />
      <Typography
        className={npsErrorTextClassName}
        component="p"
        variant="body1"
      >
        Please select a score between 1-10.
      </Typography>
      <div className={classes.submitButtonContainer}>
        <Button
          className={classes.submitButton}
          color="primary"
          disabled={npsScore === null}
          onClick={submitForm}
          variant="contained"
        >
          Submit
        </Button>
      </div>
    </Fragment>
  );
};

/* NPSModal
 * @param props.currentUserId - snowplow param
 * @param props.source string - snowplow param
 *
 * @description parent component gets currentUserId and passes source
 */
export const NPSModal = props => {
  const { currentUserId, source } = props;
  const history = useHistory();
  const classes = useStyles();

  const { data: shouldShow } = useQuery(SHOULD_SHOW_NPS, {
    fetchPolicy: "network-only"
  });

  const { data: getLast } = useQuery(GET_LAST_NPS, {
    fetchPolicy: "network-only"
  });

  // owner has confirmed drop off
  const [npsFormAvailable, setNpsFormAvailable] = useState(
    shouldShow.shouldShowNpsQuestion
  );

  // owner has interacted with nps form
  const [npsScoreSubmitted, setNpsScoreSubmitted] = useState(
    // If there is a last score and the last score was submitted recently, set to true
    getLast.getLastNpsScore && moment(getLast.getLastNpsScore.createdAt.getTime) > moment().startOf('hour').fromNow()
  );
  // are we showing the confirmation text?
  // occurs after snowplow event & localstorage updated
  const [showNpsConfirmation, setShowNpsConfirmation] = useState(false);

  useEffect(() => {
    // check to see if we are navigating around in a drawer
    console.log(getLast);
    console.log("score submitted: " + npsScoreSubmitted);
    setNpsFormAvailable(shouldShow.shouldShowNpsQuestion);
    console.log("should show: " + shouldShow.shouldShowNpsQuestion);
    console.log("nps available: " + npsFormAvailable);
  }, [history.location.pathname]);

  // update localStorage
  const updateLocalStorage = dismissing => {
    if (!npsFormAvailable) {
      setNpsFormAvailable(true);
    }
    // then close modal
    if (dismissing) {
      setNpsFormAvailable(false);
      setNpsScoreSubmitted(true);
    }
  };

  // if we haven't submitted form data, snowplow event
  // if we have, it means we are dismissing from confirmation screen
  // close modal
  const onDismiss = () => {
    if (!npsScoreSubmitted) {
      Snowplow.handleGenericEvent(
        // category, action, label, property, value, context
        "User Interaction",
        "Button Clicked",
        "NPS Form Dismissed",
        {
          score: null,
          comment: "",
          source
        },
        "",
        "",
        currentUserId
      );
    }
    updateLocalStorage(true);
  };

  // we have confirmed a drop off and haven't submitted an NPS score yet
  const dialogOpen = npsFormAvailable && !npsScoreSubmitted;

  return (
    <ActionDialog
      open={dialogOpen}
      onClose={onDismiss}
      content={
        <NPSFormContent
          currentUserId={currentUserId}
          onDismiss={onDismiss}
          npsScoreSubmitted={npsScoreSubmitted}
          setShowNpsConfirmation={setShowNpsConfirmation}
          showNpsConfirmation={showNpsConfirmation}
          source={source}
          updateLocalStorage={updateLocalStorage}
        />
      }
      maxWidth="sm"
      className={classes.npsContainer}
      classes={{
        dialogPaper: classes.npsRoot
      }}
    />
  );
};

export default NPSModal;
