const request = require('supertest');
const assert = require('assert');
const { resolve } = require('path');
const url = "http://localhost:5000";

let listingID;

describe("POST /listing/add", function () {
  it("creates listing on database", function (done) {
    request(url)
      .post("/listing/add")
      .send({
        name: "Test Listing",
        asking_price: 99
      })
      .set('Accept', 'application/json')
      .expect(function (res)  {
        listingID = res.body.insertedId;
      })
      .expect(200,done);
  })
})

describe("GET /listing", function () {
  it("returns listings limited to 20", function (done) {
    request(url)
      .get("/listing")
      .expect(200)
      .then(res => {
        assert(res.body.length).to.equal(20)
        resolve();
      })
  })
});

describe("GET /listing?name=Test Listing", function () {
  const uri = "/listing/?name=Test Listing";
  it("returns all listings with queried name", function (done) {
    request(url)
      .get(encodeURI(uri))
      .expect(function (response) {
        response.body.length > 0
      })
      .expect(200, done);
  })
});

describe("GET /listing/id", function () {
  it("returns all listings with queried name", function (done) {
    request(url)
      .get(`/listing/${listingID}`)
      . expect(200, {
        _id: listingID,
        name: "Test Listing",
        asking_price: 99
      }, done)
  })
});