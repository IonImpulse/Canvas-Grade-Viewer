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

    for (var i = 0; i < assignmentsList.length; i++) {
        var tempAssignment = assignmentsList[i].innerHTML.split("\n");
        var lengthInner = tempAssignment.length;

        if (checkZeroConvert(tempAssignment[lengthInner-56].replace(/\s/g,'')) != "" && checkZeroConvert(tempAssignment[lengthInner-31].replace(/\s/g,'')) != 0) {
            grades.push(checkZeroConvert(tempAssignment[lengthInner-56].replace(/\s/g,'')));

            gradeMaxes.push(checkZeroConvert(tempAssignment[lengthInner-31].replace(/\s/g,'')));

            gradeTypes.push(isolateWeight(tempAssignment[4]));
        }
    }

    console.log(grades);
    console.log(gradeMaxes);

    var weightsListRaw = document.getElementById("assignments-not-weighted").innerHTML.split("\n");

    if (isolateWeight(weightsListRaw[3]) == "Assignments are weighted by group:") {
        var weightsExist = true;
        console.log("True")
        var weightNames = [];
        var weightValues = [];
        var iterations = weightsListRaw.length - 15;

        for (i = 14; i < iterations; i = i + 4) {
            var tempWeightName = weightsListRaw[i];
            var tempWeightValue = weightsListRaw[i + 1];

            weightNames.push(isolateWeight(tempWeightName));
            weightValues.push(parseFloat(isolateWeight(tempWeightValue)));
        }

    } else {
        var weightsExist = false;
    }

    if (weightsExist == false) {
        var totalGrade = 0;
        var totalMax = 0;
        for (var i = 0; i < grades.length; i++) {
            totalGrade = totalGrade + grades[i];
            totalMax = totalMax + gradeMaxes[i];
        }

        if (totalGrade == 0) {
            totalGrade = "N/A";
        } else {
            totalGrade = totalGrade/totalMax*100;
        }


    } else {
        var totalGrade = 0;
        var weightGrade = [];
        var weightMax = [];

        for (var i = 0; i < weightNames.length; i++) {
            weightGrade.push(0);
            weightMax.push(0);

            for (var j = 0; j < grades.length; j++) {
                if (gradeTypes[j] == weightNames[i]) {
                    weightGrade[i] = weightGrade[i] + grades[j];
                    weightMax[i] = weightMax[i] + gradeMaxes[j];
                }
            }
            console.log(weightGrade);
            console.log(weightMax);
            if (weightMax[i] != 0) {
                totalGrade = totalGrade + (weightGrade[i]/weightMax[i] * (weightValues[i]/100) * 100);
            }

        }
    }

    console.log(totalGrade);

    var gradeOutput = document.getElementById("student-grades-right-content");
    var tempDiv = gradeOutput.innerHTML.split("\n");
    tempDiv[2] = "Total: " + (totalGrade.toString());
    gradeOutput = tempDiv.join("\n");

}, false);
