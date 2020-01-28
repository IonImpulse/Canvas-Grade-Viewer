function gradeCheck() {
    function checkZeroConvert(stringNum) {
        if (parseFloat(stringNum) == NaN) {
            stringNum = 0.0;
            //console.log("Did not work");
        } else {
            stringNum = parseFloat(stringNum);
        }
        return stringNum;
    
    }

    function findIGrade(inputAssignment) {
        var outputGrade = inputAssignment[inputAssignment.length - 56].replace(/\s/g,'');
        //console.log("First",outputGrade);

        if (isNaN(inputAssignment[inputAssignment.length - 54].replace(/\s/g,'')) == false) {
            outputGrade = inputAssignment[inputAssignment.length - 60].replace(/\s/g,'');
            //console.log("Reverted whatif", outputGrade)
        } else {
            if (outputGrade != "" && isNaN(parseFloat(outputGrade)) == true) {
                outputGrade = isolateWeight(inputAssignment[inputAssignment.length - 43].replace(/\s/g,''));
                //console.log("Second",outputGrade);
            }
        }
        
        

        outputGrade = parseFloat(outputGrade);
        return(outputGrade);
    }

    function isolateWeight(weightString) {
        weightString = weightString.slice(weightString.indexOf(">") + 1, weightString.indexOf("<", weightString.indexOf(">")));
        return weightString;
    }

    var assignmentsList = document.getElementsByClassName("student_assignment editable");
    //console.log(assignmentsList);
    var grades = [];
    var gradeMaxes = [];
    var gradeTypes = [];
    var weightSum = 100;

    for (var i = 0; i < assignmentsList.length; i++) {
        var tempAssignment = assignmentsList[i].innerHTML.split("\n");
        var lengthInner = tempAssignment.length;
        //console.log(tempAssignment);

        var gradeFound = findIGrade(tempAssignment);

        if (gradeFound != "" && isNaN(gradeFound) == false && checkZeroConvert(tempAssignment[lengthInner-31].replace(/\s/g,'')) != 0) {
            
            grades.push(gradeFound);

            gradeMaxes.push(checkZeroConvert(tempAssignment[lengthInner-31].replace(/\s/g,'')));

            gradeTypes.push(isolateWeight(tempAssignment[4]));
        }
    }

    //console.log(grades);
    //console.log(gradeMaxes);

    var weightsListRaw = document.getElementById("assignments-not-weighted").innerHTML.split("\n");

    if (isolateWeight(weightsListRaw[3]) == "Assignments are weighted by group:") {
        var weightsExist = true;
        //console.log("True")
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
        }

        //console.log(weightValues);
        var emptyWeights = [];
        weightSum = 0;

        for (var i = 0; i < weightValues.length; i++) {
            weightSum = weightSum + weightValues[i];
        }


        for (var i = 0; i < weightMax.length; i++) {
            if (weightMax[i] == 0) {
                emptyWeights.push(weightValues[i]);
                var multiplier = weightValues[i];
                for (var j = 0; j < weightValues.length; j++) {
                    weightValues[j] = weightValues[j] * (weightSum/(weightSum-multiplier));
                }
            }
        }

        for (var i = 0; i < weightMax.length; i++) {
          if (weightMax[i] != 0) {
              //console.log(totalGrade, weightGrade[i], weightMax[i], weightValues[i]);
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

document.addEventListener('mouseup', function() {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
     }
    async function WaitForGrade() {
        //console.log("waiting..");
        await sleep(200);
        //console.log("done!");
        gradeCheck();
        //console.log("mouse clicked");
        
    }
    WaitForGrade();
}, false);

document.addEventListener('keydown', function(e) {
    if(e.keyCode == 13) {
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
         }
        async function WaitForGrade() {
            //console.log("waiting..");
            await sleep(200);
            //console.log("done!");
            gradeCheck();
            //console.log("mouse clicked");
            
        }
        WaitForGrade();
        //console.log("enter was pressed");
    }
}, false);