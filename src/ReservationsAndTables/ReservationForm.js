import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { createReservation, editReservation } from "../utils/api";
import { today, formatDate, asDateString } from "../utils/date-time";
import ErrorAlert from "../layout/ErrorAlert";
const newToday = today();

function ReservationForm({ initialFormData }) {
  const history = useHistory();
  const { pathname } = useLocation();
  const isEdit = pathname.includes("edit");
  const isNew = pathname.includes("new");


  const [reservation, setReservation] = useState({ ...initialFormData });
  const [error, setError] = useState(null);
  const [validDate, setValidDate] = useState(true);
  const [validTime, setValidTime] = useState(true);

  useEffect(() => {
    let dateChosen = new Date(initialFormData.reservation_date);
    if (isEdit) {
      setReservation({
        ...initialFormData,
        reservation_date: asDateString(dateChosen),
      });
    }
  }, [initialFormData]);

  function validReservationDates({ target }) {
    // dates must be in converted from yyyy/mm/dd to mm/dd/yyyy for Date.prototype conversion
    const dateChosen = new Date(formatDate(target.value));
    const today = new Date(formatDate(newToday));
    const isNotTuesday = dateChosen.getDay() !== 2; // 2 = tuesday's index
    const isThisDayOrAfter = dateChosen.getDate() >= today.getDate();
    const isThisMonthOrAfter = dateChosen.getMonth() >= today.getMonth();
    const isThisYearOrAfter = dateChosen.getFullYear() >= today.getFullYear();
    if (
      isNotTuesday &&
      isThisDayOrAfter &&
      isThisMonthOrAfter &&
      isThisYearOrAfter
    ) {
      setValidDate(true);
      setReservation(
        (form) => (form = { ...form, reservation_date: target.value })
      );
    } else {
      setReservation((form) => (form = { ...form, reservation_date: "" }));
      setValidDate(false);
    }
  }

  function validReservationTimes({ target }) {
    let timeChosen = target.value;
    let chosenMinutes = Number(`${timeChosen[3]}${timeChosen[4]}`);
    let chosenHour = Number(`${timeChosen[0]}${timeChosen[1]}`);
    const MintoNextHalfHour = 30 - chosenMinutes;
    timeChosen = timeChosen.split("");
    timeChosen = timeChosen.splice(0, 2);

    const currentTime = new Date(Date.now());
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    if (chosenMinutes === 30) {
      timeChosen = `${timeChosen.join("")}:${chosenMinutes}`;
    } else if (chosenMinutes === 0) {
      timeChosen = `${timeChosen.join("")}:${chosenMinutes}0`;
    } else if (MintoNextHalfHour > 0) {
      timeChosen = `${timeChosen.join("")}:30`;
      chosenMinutes = 30;
    } else if (MintoNextHalfHour < 0) {
      chosenHour = Number(timeChosen.join("")) + 1;
      timeChosen = `${chosenHour}:00`;
      chosenMinutes = 0;
    }

    //return error message if chosen time is outsisde operating hours
    if (
      (chosenHour === 21 && chosenMinutes === 30) ||
      chosenHour > 21 ||
      (chosenHour === 10 && chosenMinutes === 0) ||
      chosenHour < 10
    ) {
      setReservation((form) => (form = { ...form, reservation_time: "" }));
      return setValidTime(false);
    } else {
      setValidTime(true);
    }

    if (reservation.reservation_date === newToday) {
      // if the chosen hour is later than the current hour (current hour is less than chosen hour) set reservation time
      if (currentHour < chosenHour) {
        setValidTime(true);
        setReservation(
          (form) => (form = { ...form, reservation_time: timeChosen })
        );
      }
      // if the chosen hour is earlier than the current hour (current hour is greater than the chosen hour ) display error message
      else if (currentHour > chosenHour) {
        setValidTime(false);
      }
      // if hours are the same check minutes
      else {
        // if the chosen minute is later than the current minute ( current minute is less than the chosen minute ) set reservation time
        if (currentMinute < chosenMinutes) {
          setValidTime(true);
          setReservation(
            (form) => (form = { ...form, reservation_time: timeChosen })
          );
        }
        // if the chosen minute is earlier than the current minute (current minute is greater than chosen minute) display error message
        else {
          setValidTime(false);
        }
      }
    } else {
      setReservation(
        (form) => (form = { ...form, reservation_time: timeChosen })
      );
    }
  }

  function handleChange({ target: { name, value } }) {
    setReservation({ ...reservation, [name]: value });
  }

  async function APIOnSubmit(event) {
    const abortController = new AbortController();
    setError(null)
    //if this is an edit: call editReservation from API, else: call is createReservation from API
    if (isEdit) {
      try {
        await editReservation(
          reservation,
          reservation.reservation_id,
          abortController.signal
        );
        // navigate to dashboard is promise is resolved
        navigateToDashboard();
      } catch (error) {
        //set error to display if caught
        setError((err) => (err = error));
      }
    } else if (isNew) {
      try {
        await createReservation(reservation, abortController.signal);
        // navigate to dashboard is promise is resolved
        navigateToDashboard();
      } catch (error) {
        //set error to display if caught
        setError((err) => (err = error));
      }
    }

    return () => abortController.abort();
  }

  function navigateToDashboard() {
      setReservation({ ...initialFormData });
      history.push(`/dashboard?date=${reservation.reservation_date}`);
  }

  function handleSubmit(event) {
    event.preventDefault();
    APIOnSubmit(event);
  }
  return (
    <div>
      <div>
        <ErrorAlert error={error} />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col">
            <label for="first_name">First Name</label>
            <br />
            <input
              type="text"
              onChange={handleChange}
              name="first_name"
              value={reservation.first_name}
              required={true}
            />
          </div>
          <div className="col">
            <label for="last_name">Last Name</label>
            <br />
            <input
              type="text"
              onChange={handleChange}
              name="last_name"
              value={reservation.last_name}
              required={true}
            />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <label for="mobile_number">Mobile Number</label>
            <br />
            <input
              type="text"
              onChange={handleChange}
              name="mobile_number"
              value={reservation.mobile_number}
              required={true}
            />
          </div>
          <div className="col">
            <label for="people">Party Size</label>
            <br />
            <input
              type="text"
              onChange={handleChange}
              name="people"
              value={reservation.people}
              required={true}
            />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <label for="reservation_date">Date of Reservation</label>
            <br />
            <input
              type="date"
              onChange={validReservationDates}
              name="reservation_date"
              value={reservation.reservation_date}
              required={true}
            />
            <div>
              {validDate ? null : (
                <p className="alert alert-danger">
                  Please enter a valid date. (We are closed on tuesdays)
                </p>
              )}
            </div>
          </div>
          <div className="col">
            <label for="reservation_time">Time of Reservation</label>
            <br />
            <input
              type="time"
              step="300"
              min="10:30"
              max="21:30"
              onChange={validReservationTimes}
              name="reservation_time"
              value={reservation.reservation_time}
              required={true}
            />
            <div>
              {validTime ? null : (
                <p className="alert alert-danger">
                  Please enter a valid time. (We reserve tables from 10:30AM to
                  9:30PM on every half hour.)
                </p>
              )}
            </div>
          </div>
        </div>
        <div
          style={{ margin: "25px 0 0 0" }}
          className="row w-75 justify-content-center"
        >
          <button className="btn btn-primary" type="submit">
            Submit
          </button>
          <button
            onClick={() =>
              history.push(`/dashboard?date=${reservation.reservation_date}`)
            }
            className="btn btn-secondary"
            type="cancel"
          >
            Cancel
          </button>
          {isEdit ? (
            <div>
              <button className="btn btn-danger">Cancel Reservation</button>
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}

export default ReservationForm;
