document.addEventListener('DOMContentLoaded', function() {
    function checkZeroConvert(stringNum) {
        if (stringNum == "") {
            stringNum = 0.0;
        } else {
            stringNum = parseFloat(stringNum);
        }
        return stringNum;
    }

    function isolateWeight(weightString) {
        weightString = weightString.slice(weightString.indexOf(">") + 1, weightString.indexOf("<", weightString.indexOf(">")));
        return weightString;
    }
    var assignmentsList = document.getElementsByClassName("student_assignment editable");
    var grades = [];
    var gradeMaxes = [];
    var gradeTypes = [];

    console.log(assignmentsList[0].innerHTML.split("\n"));

    for (var i = 0; i < assignmentsList.length; i++) {
        var tempAssignment = assignmentsList[i].innerHTML.split("\n");
        var lengthInner = tempAssignment.length;

        grades.push(checkZeroConvert(tempAssignment[lengthInner-56].replace(/\s/g,'')));

        gradeMaxes.push(checkZeroConvert(tempAssignment[lengthInner-31].replace(/\s/g,'')));

        gradeTypes.push(isolateWeight(tempAssignment[4]));
    }

    console.log(grades);
    console.log(gradeMaxes);
    console.log(gradeTypes);

    var weightsListRaw = document.getElementById("assignments-not-weighted").innerHTML.split("\n");

    if (isolateWeight(weightsListRaw[3]) == "Assignments are weighted by group:") {
        var weightsExist = true;

        var weightNames = []
        var weightValues = []
        var iterations = weightsListRaw.length - 15

        console.log(weightsListRaw);

        for (i = 14; i < iterations; i = i + 4) {
            var tempWeightName = weightsListRaw[i];
            var tempWeightValue = weightsListRaw[i + 1];

            weightNames.push(isolateWeight(tempWeightName));
            weightValues.push(parseFloat(isolateWeight(tempWeightValue)));
        }

        console.log(weightNames);
        console.log(weightValues);
    } else {
        var weightsExist = false;
    }




}, false);
