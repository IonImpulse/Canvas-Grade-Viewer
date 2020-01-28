function gradeCheck() {
    function checkZeroConvert(stringNum) {
        if (stringNum == "") {
            stringNum = 0.0;
        } else {
            stringNum = parseFloat(stringNum);
        }
        return stringNum;
    
    }
    function findIGrade(inputAssignment) {
        var outputGrade = 0
        inputAssignment
    }

    function isolateWeight(weightString) {
        weightString = weightString.slice(weightString.indexOf(">") + 1, weightString.indexOf("<", weightString.indexOf(">")));
        return weightString;
    }
    var assignmentsList = document.getElementsByClassName("student_assignment editable");
    console.log(assignmentsList)
    var grades = [];
    var gradeMaxes = [];
    var gradeTypes = [];
    var weightSum = 100;

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
        }

        console.log(weightValues);
        var emptyWeights = [];
        weightSum = 0;

        for (var i = 0; i < weightValues.length; i++) {
            weightSum = weightSum + weightValues[i];
        }


        for (var i = 0; i < weightMax.length; i++) {
            if (weightMax[i] == 0) {
                console.log("hl");
                emptyWeights.push(weightValues[i]);
                var multiplier = weightValues[i];
                console.log(multiplier);
                for (var j = 0; j < weightValues.length; j++) {
                    console.log(j);
                    weightValues[j] = weightValues[j] * (weightSum/(weightSum-multiplier));
                }
            }
            console.log(weightValues);
        }

        console.log(weightGrade, weightMax);
        for (var i = 0; i < weightMax.length; i++) {
          if (weightMax[i] != 0) {
              console.log(totalGrade, weightGrade[i], weightMax[i], weightValues[i]);
              totalGrade = totalGrade + (weightGrade[i]/weightMax[i] * (weightValues[i]/100) * 100);
          }
        }
    }
    console.log(totalGrade);

    var gradeOutput = document.getElementById("student-grades-right-content");
    var tempDiv = gradeOutput.innerHTML.split("\n");
    tempDiv[2] = "Total: ";

    if (weightSum != 100) {
      tempDiv[2] = tempDiv[2] + ((totalGrade/weightSum*100).toString()).slice(0,5) + "% ("  + (totalGrade.toString()).slice(0,5) + "% out of " + (weightSum.toString()).slice(0,5) + "%)";
    }
    else {
      tempDiv[2] = tempDiv[2] + (totalGrade.toString()).slice(0,5) + "%";
    }
    document.getElementById("student-grades-right-content").innerHTML = tempDiv.join("\n");

}

document.addEventListener('DOMContentLoaded', function() {
    gradeCheck();
}, false);

document.addEventListener('selectionchange', function() {
    gradeCheck();
    console.log("HEEEE")
}, false);
