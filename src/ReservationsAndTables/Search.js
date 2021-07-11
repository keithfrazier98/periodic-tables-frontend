import React, { useEffect, useState } from "react";
import { searchByNumber } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationCard from "./ReservationCard";

function Search() {
  const placeholder = "Enter a customer's phone number";
  const [reservations, setReservations] = useState([]);
  const [mobile_number, setMobileNumber] = useState(placeholder);
  const [searchError, setSearchError] = useState("");
  const [emptySearch, setEmptySearch] = useState(true);
  const [noResultsFound, setNoResultsFound] = useState(false);
  useEffect(() => {
    loadReservations();
  }, [mobile_number]);

  async function loadReservations() {
    try {
      if (mobile_number) {
        const reservationResults = await searchByNumber(mobile_number);
        setReservations(reservationResults);
        if (
          mobile_number &&
          !reservations.length &&
          mobile_number !== placeholder
        ) {
          setNoResultsFound(true);
        }
      } else {
        setNoResultsFound(false);
      }
    } catch (error) {
      setSearchError(error);
    }
  }

  function search(value) {
    if (value) {
      setEmptySearch(false);
      setMobileNumber(value);
    } else {
      setEmptySearch(true);
      setMobileNumber(value);
    }
  }

  function onChange({ target: { value } }) {
    if (value !== " ") search(value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    search(mobile_number);
  }

  const noResultsFoundElement = (
    <div>
      <h5>No reservations found</h5>
    </div>
  );

  const emptySearchElement = (
    <div className="row justify-content-center">
      <h4>Enter a mobile number to search reservations.</h4>
    </div>
  );

  return (
    <div style={{ margin: "30px 0 30px 30px" }}>
      <div>
        <form onSubmit={handleSubmit}>
          <ErrorAlert error={searchError} />
          <div className="row align-items-end">
            <div className="col">
              <label className="w-100">
                <h5>Search by mobile number:</h5>
                <input
                  className="w-75 p-1"
                  type="search"
                  value={mobile_number}
                  onChange={onChange}
                  name="mobile_number"
                ></input>
              </label>
            </div>
            <div className="col">
              <button type="submit" className="btn btn-primary">
                Find
              </button>
            </div>
          </div>
        </form>
      </div>
      <div className="col p-5">
        {emptySearch ? (
          emptySearchElement
        ) : (
          <ReservationCard reservations={reservations} />
        )}
      </div>
      <div className="col">{noResultsFound ? noResultsFoundElement : null}</div>
    </div>
  );
}

export default Search;
