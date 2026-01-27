package handlers

const (
	testErrMessWrongBodyFormat = `{"error":"wrong body format","data":null}` + "\n"
	testErrMessUpdateTask      = `{"error":"failed to update task","data":null}` + "\n"
	testErrMessFindTask        = `{"error":"failed to find task","data":null}` + "\n"
	testErrMessCreateTask      = `{"error":"failed to create task","data":null}` + "\n"

	testErrMessWrongBodyFormatWithTotal = `{"error":"wrong body format","data":null,"total":0}` + "\n"
	testErrMessFailedGetTasksWithTotal  = `{"error":"failed to get tasks","data":null,"total":0}` + "\n"
)
