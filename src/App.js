import "./App.css"
import React, { useState, useEffect } from "react"
import firebase from "firebase"
import { Helmet } from "react-helmet"

import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import TextField from "@material-ui/core/TextField"
import AddIcon from "@material-ui/icons/Add"
import RemoveIcon from "@material-ui/icons/Remove"
import Snackbar from "@material-ui/core/Snackbar"
import MuiAlert from "@material-ui/lab/Alert"

import Autocomplete, {
  createFilterOptions
} from "@material-ui/lab/Autocomplete"
const filter = createFilterOptions()

// config firebase
if (!firebase.apps.length) {
  const firebaseConfig = {
    apiKey: process.env.REACT_APP_APIKEY,
    authDomain: process.env.REACT_APP_AUTHDOMAIN,
    databaseURL: process.env.REACT_APP_DATABASEURL,
    projectId: process.env.REACT_APP_PROJECTID,
    storageBucket: process.env.REACT_APP_STORAGEBUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
    appId: process.env.REACT_APP_APPID,
    measurementId: process.env.REACT_APP_MEASUREMENTID
  }
  firebase.initializeApp(firebaseConfig)
}

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

const exc = [{ oefening: "", weight: 0 }]

const autcompletevalues = [{ oefening: "", weight: 0 }]

function App() {
  const [user, setUser] = useState({})
  const date = new Date().toLocaleDateString()
  // const [oefening, setOefening] = useState("")
  // const [gewicht, setGewicht] = useState(0)
  const [exercise, setExercise] = useState([{ oefening: "", gewicht: 0 }])
  const [ex, setEx] = useState({ oefening: "", gewicht: 0 })

  const [entryPassed, setEntryPassed] = useState(false)
  const [openSuccess, setOpenSucess] = React.useState(false)
  const [openError, setOpenError] = React.useState(false)

  const [showProgress, setShowProgress] = useState(false)
  const [progressData, setProgressData] = useState()

  const [value, setValue] = useState(null)

  const getData = () => {
    setShowProgress(true)
    const db = firebase.firestore()
    let result = []
    db.collection("Users")
      .doc(user.email)
      .collection("Workouts")
      .get()
      .then(function (x) {
        x.forEach(function (y) {
          // console.log(y.data().date.toDate())
          // console.log(y.data())
          result.push({
            date: y.data().date.toDate(),
            exercise: y.data().exercise
          })
        })
        setProgressData(result)
      })
  }

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return
    }

    setOpenSucess(false)
    setOpenError(false)
  }

  const submit = () => {
    // disable button by telling the app that entryPass is true.
    // When something goes wrong change it back to false.
    setEntryPassed(true)

    //check values
    if (
      exercise[0].oefening.length <= 0 ||
      exercise[0].oefening.length > 30 ||
      exercise[0].gewicht <= 0 ||
      exercise[0].gewicht.length > 30
    ) {
      //show error
      setEntryPassed(false)
      return console.log("exercise issue")
    }

    const data = {
      exercise
    }
    // const testUserDate = testUser + testDate;
    //add entry to db

    //using test entries. Change to the others variables when done testing
    setEntry(user, date, data)
  }

  const setEntry = (user, date, data) => {
    const db = firebase.firestore()
    //when adding data it is easily possible to create a new User or a new workout date, just fill in the new data and if it doesn't exist the database creates it for you!
    db.collection("Users")
      .doc(user.email)
      .collection("Workouts")
      .doc()
      .set({ ...data, date: firebase.firestore.Timestamp.fromDate(new Date()) })
      .then(function () {
        setEntryPassed(true)
        setOpenSucess(true)
      })
      .catch(function (error) {
        setEntryPassed(false)
        setOpenError(true)
        console.log(error)
      })
  }

  const handleInputChange = (e, index) => {
    setEntryPassed(false)
    const { name, value } = e.target
    const list = [...exercise]
    list[index][name] = value
    setExercise(list)
  }

  // handle click event of the Remove button
  const handleRemoveClick = (index) => {
    const list = [...exercise]
    list.splice(index, 1)
    setExercise(list)
  }

  // handle click event of the Add button
  const handleAddClick = () => {
    setExercise([...exercise, { oefening: "", gewicht: "" }])
  }

  const onLogin = () => {
    var provider = new firebase.auth.GoogleAuthProvider()

    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function (result) {
        // console.log(`login successful!`)
      })
      .catch(function (error) {
        console.log(`Something went wrong...`)
        console.log(error)
      })
  }

  const onLogout = () => {
    firebase
      .auth()
      .signOut()
      .then(function () {
        console.log(`sign out successful`)
        setUser({})
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  const isEmpty = (obj) => {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false
      }
    }

    return JSON.stringify(obj) === JSON.stringify({})
  }

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // console.log(`user signed in: `, user.displayName)
        setUser(user)
      } else {
        // console.log(`nobody has signed in yet...`)
      }
    })
  })

  return (
    <div id="body">
      {!isEmpty(user) ? (
        <div id="content">
          <h1>Welkom {user.displayName}</h1>

          {exercise.map((x, i) => {
            return (
              <div key={`${i}-${x.oefening}`} id="content_form">
                <div id="content_form_textfield">
                  {/* <TextField
                    fullWidth
                    name="oefening"
                    label="oefening"
                    value={x.oefening}
                    onChange={(e) => handleInputChange(e, i)}
                  /> */}
                  <Autocomplete
                    value={x}
                    multiple={false}
                    onChange={(event, newValue, reason) => {
                      if (newValue && newValue.inputValue) {
                        // Create a new value from the user input

                        let list = [...exercise]
                        list[i] = {
                          oefening: newValue.inputValue,
                          gewicht: 0
                        }

                        setExercise(list)
                      } else if (newValue) {
                        // Value is autocomplete

                        let list = [...exercise]
                        list[i] = {
                          oefening: newValue.oefening,
                          gewicht: 0
                        }

                        setExercise(list)
                      } else {
                        // Value is null
                        setExercise([...exercise])
                      }
                    }}
                    filterOptions={(options, params) => {
                      const filtered = filter(options, params)

                      // Suggest the creation of a new value
                      if (params.inputValue !== "") {
                        filtered.push({
                          inputValue: params.inputValue,
                          oefening: `Add "${params.inputValue}"`
                        })
                      }

                      return filtered
                    }}
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                    getOptionLabel={(option) => {
                      // Value selected with enter, right from the input
                      if (typeof option === "string") {
                        return option
                      }
                      // Add "xxx" option created dynamically
                      if (option.inputValue) {
                        return option.inputValue
                      }
                      // Regular option
                      return option.oefening
                    }}
                    renderOption={(option) => option.oefening}
                    freeSolo
                    options={exercises}
                    fullWidth
                    renderInput={(params) => (
                      <TextField {...params} label="oefening" name="oefening" />
                    )}
                  />

                  {console.log(`exercise: `, exercise)}
                </div>
                <div id="content_form_textfield">
                  <TextField
                    // variant="outlined"
                    fullWidth={true}
                    name="gewicht"
                    label="gewicht"
                    value={x.gewicht}
                    onChange={(e) => handleInputChange(e, i)}
                    type="number"
                  />
                  {exercise.length - 1 === i && (
                    <IconButton
                      variant="outlined"
                      color="primary"
                      onClick={() => handleAddClick(i)}
                    >
                      <AddIcon />
                    </IconButton>
                  )}
                  {exercise.length !== 1 && (
                    <IconButton
                      variant="contained"
                      color="secondary"
                      onClick={() => handleRemoveClick(i)}
                    >
                      <RemoveIcon />
                    </IconButton>
                  )}
                </div>
              </div>
            )
          })}

          <div id="button">
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={submit}
              disabled={entryPassed}
            >
              submit
            </Button>
          </div>
          <div id="button">
            <Button
              fullWidth
              onClick={onLogout}
              color="secondary"
              variant="contained"
            >
              Logout
            </Button>
          </div>

          {showProgress ? (
            <div>
              Progress data:
              <div>
                <pre>{JSON.stringify(progressData, null, 2)}</pre>
                {console.log(progressData)}
                {/* <pre>{JSON.stringify(progressData.inputList, null, 2)}</pre> */}
              </div>
              <div id="button">
                <Button
                  fullWidth
                  onClick={() => setShowProgress(false)}
                  color="secondary"
                  variant="contained"
                >
                  Close progress
                </Button>
              </div>
            </div>
          ) : (
            <div id="button">
              <Button
                fullWidth
                onClick={getData}
                color="secondary"
                variant="contained"
              >
                Show progress
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div id="button">
          <Button onClick={onLogin} variant="contained">
            Login with google
          </Button>
        </div>
      )}

      <Snackbar
        open={openSuccess}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success">
          Gelukt!
        </Alert>
      </Snackbar>

      <Snackbar open={openError} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error">
          Er is iets mis gegaan...
        </Alert>
      </Snackbar>

      <Helmet>
        <title>{"Fitness-Pall by Hakan Taskirmaz"}</title>
      </Helmet>
    </div>
  )
}

const exercises = [
  { oefening: "Bench press", Category: "Chest", inputValue: "" },
  { oefening: "Crossover", Category: "Chest", inputValue: "" },
  { oefening: "Cable fly", Category: "Chest", inputValue: "" },
  { oefening: "Chest press", Category: "Chest", inputValue: "" },
  { oefening: "Incline bench press", Category: "Chest", inputValue: "" },
  { oefening: "Decline bench press", Category: "Chest", inputValue: "" },
  { oefening: "Lat pulley", Category: "Back", inputValue: "" },
  { oefening: "Tricep push down", Category: "Tricep", inputValue: "" },
  { oefening: "Deadlift", Category: "Full body", inputValue: "" },
  { oefening: "Squats", Category: "Thighs", inputValue: "" }
]

export default App
