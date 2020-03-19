const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const data = require("./CDC.json");
const States = new Set();
const CauseName = new Set();
data.data.forEach(item => {
  States.add(item[11]);
  CauseName.add(item[10]);
});

app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "http://localhost:3000"
  })
  next();
});

app.options("", (req, res) => res.send("OK"));

// data/searchSuggest?selector={COLUMN}&query={SEARCH}
// returns string[]
app.get("/data/searchSuggest", (req, res) => {
  const selector = req.query.selector;
  const query = req.query.query;
  const columns = data.meta.view.columns;
  const column = columns.find(item => item.name === req.query.selector);
  if (
    !selector ||
    query === undefined||
    !(selector === "State" ||
    selector === "Cause Name") ||
    !selector
  )
    return res.send([]);
  if(selector === "State") {
    const matches = [];
    States.forEach(item => {
      if(item.indexOf(query) !== -1) matches.push(item);
    });
    return res.send(matches);
  } else {
    const matches = [];
    CauseName.forEach(item => {
      if(item.indexOf(query) !== -1) matches.push(item);
    });
    return res.send(matches);
  }
  res.send(null);
});

/*
/data
Query params, processed from top to bottom: 
searchField="State" | "Cause Name" - default: None
searchQuery=string - default: None - Only used if searchField is passed
sortField=number - default: None - Sorts passed on the row index (e.g. pass 8 to sort by year)
sortAscending="Y" | "N" - default: "Y" - only used if sortField is passed
start=number - default: 100 - from which index to select the next 100 from

returns row[]
*/

app.get("/data", (req, res) => {
  let _data = [...data.data];
  const searchField = req.query.searchField;
  const sortField = req.query.sortField;
  if(searchField && searchField === "State" || searchField === "Cause Name") {
    _data = _data.filter(item => item[searchField === "State" ? 11 : 10].toLowerCase().indexOf((req.query.searchQuery || "").toLowerCase()) !== -1);
  }
  if(sortField && sortField >= 0 && sortField <= 13) {
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base"
    });
    _data = _data.sort((a, b) =>
      collator.compare(
        req.query.sortAscending === "N" ? b[sortField] : a[sortField],
        req.query.sortAscending === "N" ? a[sortField] : b[sortField]
      )
    );
  }
  const start = parseInt(req.query.start) || 0;
  return res.send(_data.slice(start, start + 100));
});

app.listen(PORT, (error) => {
  if(!error) return console.log(`Listening on port ${PORT}`)
  console.log("Error starting server");
  console.log(err);
});