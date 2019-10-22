browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, { command: "requestGrade" }, (response) => {
        this._gradesList = JSON.parse(response);
        console.log(this._gradesList);
    });
});
