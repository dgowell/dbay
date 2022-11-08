const request = require("supertest")("http://localhost:5000");
const expect = require("chai").expect;

describe("POST /listing", function () {
  it("returns 200")
})

describe("GET /listing", function () {
  it("returns at least 1 listing", async function () {
    const response = await request.get("/listing");

    expect(response.status).to.eql(200);
    expect(response.body.length).to.be.above(0);
  });
});

