import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Listing = (props) => (
    <tr>
        <td>{props.listing.name}</td>
        <td>{props.listing.position}</td>
        <td>{props.listing.level}</td>
        <td>
            <Link className="btn btn-link" to={`/edit/${props.listing._id}`}>Edit</Link> |
            <button className="btn btn-link"
                onClick={() => {
                    props.deleteListing(props.listing._id);
                }}
            >
                Delete
            </button>
        </td>
    </tr>
);

export default function ListingList() {
    const [listings, setListings] = useState([]);

    // This method fetches the listings from the database.
    useEffect(() => {
        async function getListings() {
            const response = await fetch(`http://localhost:5000/listing/`);

            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }

            const listings = await response.json();
            setListings(listings);
        }

        getListings();

        return;
    }, [listings.length]);

    // This method will delete a listing
    async function deleteListing(id) {
        await fetch(`http://localhost:5000/${id}`, {
            method: "DELETE"
        });

        const newListings = listings.filter((el) => el._id !== id);
        setListings(newListings);
    }

    // This method will map out the listings on the table
    function listingList() {
        return listings.map((listing) => {
            return (
                <Listing
                    listing={listing}
                    deleteListing={() => deleteListing(listing._id)}
                    key={listing._id}
                />
            );
        });
    }

    // This following section will display the table with the listings of individuals.
    return (
        <div>
            <h3>Listing List</h3>
            <table className="table table-striped" style={{ marginTop: 20 }}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Level</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>{listingList()}</tbody>
            </table>
        </div>
    );
}