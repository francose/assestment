import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import {
  TableSortLabel,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import { Autocomplete } from "@material-ui/lab";

const useStyles = makeStyles({
  table: {
    minWidth: 650
  }
});

let loading = false;
const buildRequestString = (
  _searchField,
  _searchQuery,
  _orderBy,
  _order,
  _rows
) =>
  `http://localhost:8080/data?${
    (_searchField === "State" || _searchField === "Cause Name") &&
    !!_searchQuery
      ? `searchField=${_searchField}&searchQuery=${
          _searchQuery === null ? "" : _searchQuery
        }`
      : ""
  }&sortField=${_orderBy}&sortAscending=${_order === "asc" ? "Y" : "N"}&start=${
    _rows.length
  }`;
export default function CDCTable() {
  const classes = useStyles();
  const [rows, setRows] = React.useState([]);
  const [loadMore, setLoadMore] = React.useState(false);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState(0);
  const [searchField, setSearchField] = React.useState("State");
  const [searchQuery, setSearchQuery] = React.useState("");

  useEffect(() => {
    const getData = async () => {
      if (loadMore === true && !loading) {
        loading = true;
        const req = await fetch(
          buildRequestString(searchField, searchQuery, orderBy, order, rows)
        );
        const res = await req.json();

        setRows([...rows, ...res]);
        loading = false;
        setLoadMore(false);
      }
    };
    getData();
  }, [loadMore, order, orderBy, rows, rows.length, searchField, searchQuery]);

  useEffect(() => {
    const getData = async () => {
      const req = await fetch(
        buildRequestString(searchField, searchQuery, orderBy, order, rows)
      );
      const res = await req.json();

      setRows(res);
    };

    getData();

    const callback = e => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200
      ) {
        setLoadMore(true);
      }
    };

    window.addEventListener("scroll", callback);

    return () => window.removeEventListener("scroll", callback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSort = async n => {
    const _order = order === "asc" ? "desc" : "asc";
    const req = await fetch(
      buildRequestString(searchField, searchQuery, n, _order, rows.length)
    );
    const res = await req.json();
    setRows(res);
    setOrder(_order);
    setOrderBy(n);
  };

  useEffect(() => {
    const getData = async () => {
      const req = await fetch(
        `http://localhost:8080/data/searchSuggest?selector=${searchField}&query=${searchQuery}`
      );
      const res = await req.json();

      setSearchSuggestions(res);
    };

    getData();
  }, [searchField, searchQuery]);

  const [searchSuggestions, setSearchSuggestions] = React.useState([]);

  const preventDupMap = {};

  return (
    <div
      style={{
        marginTop: 80
      }}
    >
      <AppBar style={{ backgroundColor: "#0f3d72" }}>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          ></IconButton>
          <img
            style={{
              backgroundColor: "rgba(255,255,255, 0.25)",
              height: 50
            }}
            src="https://crossix.com/wp-content/uploads/2019/11/Crossix-Veeva_Logo_Web_lg.svg"
          />
        </Toolbar>
      </AppBar>
      <div
        style={{
          padding: 20
        }}
      >
        <div
          className="search"
          style={{
            display: "inline-flex"
          }}
        >
          <FormControl
            variant="outlined"
            disabled={!!searchQuery}
            style={{
              minWidth: 150
            }}
          >
            <InputLabel id="demo-simple-select-filled-label">
              Search Field
            </InputLabel>
            <Select
              labelId="demo-simple-select-filled-label"
              id="demo-simple-select-filled"
              value={searchField}
              onChange={e => {
                setSearchField(e.target.value);
                setSearchQuery("");
              }}
            >
              <MenuItem value={"State"}>State</MenuItem>
              <MenuItem value={"Cause Name"}>Cause Name</MenuItem>
            </Select>
          </FormControl>
          <Autocomplete
            id="combo-box-demo"
            options={searchSuggestions}
            // getOptionLabel={option => option}
            style={{ width: 300, marginLeft: 15 }}
            renderInput={params => (
              <TextField {...params} label="Seach State" variant="outlined" />
            )}
            onChange={(e, selected) => {
              if (selected === null) selected = "";
              setSearchQuery(selected);

              const getData = async () => {
                const req = await fetch(
                  buildRequestString(
                    searchField,
                    selected,
                    orderBy,
                    order,
                    rows
                  )
                );
                const res = await req.json();

                setRows(res);
                loading = false;
                setLoadMore(false);
              };

              getData();
            }}
          />
        </div>

        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sortDirection={orderBy === 0 ? order : false}>
                  <TableSortLabel
                    active={orderBy === 0}
                    direction={orderBy === 0 ? order : "asc"}
                    onClick={() => getSort(0)}
                  >
                    SID
                    {orderBy === 0 ? (
                      <span className={classes.visuallyHidden}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </span>
                    ) : null}
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === 3 ? order : false}>
                  <TableSortLabel
                    active={orderBy === 3}
                    direction={orderBy === 3 ? order : "asc"}
                    onClick={() => getSort(3)}
                  >
                    Updated on
                    {orderBy === 3 ? (
                      <span className={classes.visuallyHidden}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </span>
                    ) : null}
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === 8 ? order : false}>
                  <TableSortLabel
                    active={orderBy === 8}
                    direction={orderBy === 8 ? order : "asc"}
                    onClick={() => getSort(8)}
                  >
                    Year
                    {orderBy === 8 ? (
                      <span className={classes.visuallyHidden}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </span>
                    ) : null}
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === 10 ? order : false}>
                  <TableSortLabel
                    active={orderBy === 10}
                    direction={orderBy === 10 ? order : "asc"}
                    onClick={() => getSort(10)}
                  >
                    Cause Name
                    {orderBy === 10 ? (
                      <span className={classes.visuallyHidden}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </span>
                    ) : null}
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === 11 ? order : false}>
                  <TableSortLabel
                    active={orderBy === 11}
                    direction={orderBy === 11 ? order : "asc"}
                    onClick={() => getSort(11)}
                  >
                    State
                    {orderBy === 11 ? (
                      <span className={classes.visuallyHidden}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </span>
                    ) : null}
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === 12 ? order : false}>
                  <TableSortLabel
                    active={orderBy === 12}
                    direction={orderBy === 12 ? order : "asc"}
                    onClick={() => getSort(12)}
                  >
                    Death
                    {orderBy === 12 ? (
                      <span className={classes.visuallyHidden}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </span>
                    ) : null}
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === 13 ? order : false}>
                  <TableSortLabel
                    active={orderBy === 13}
                    direction={orderBy === 13 ? order : "asc"}
                    onClick={() => getSort(13)}
                  >
                    Age-Adjusted Death Rate
                    {orderBy === 13 ? (
                      <span className={classes.visuallyHidden}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </span>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(row => {
                if (preventDupMap[row[0]]) return null;
                preventDupMap[row[0]] = true;
                return (
                  <TableRow key={row[0]}>
                    <TableCell component="th" scope="row">
                      {row[0]}
                    </TableCell>
                    <TableCell align="right">
                      {new Date(row[3] * 1000).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">{row[8]}</TableCell>
                    <TableCell align="right">{row[10]}</TableCell>
                    <TableCell align="right">{row[11]}</TableCell>
                    <TableCell align="right">{row[12]}</TableCell>
                    <TableCell align="right">{row[13]}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}
