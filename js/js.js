var flag= true ;
function xmlParsing(xmlString, docType)
{
	var xmlDoc;
	if (window.DOMParser)
	{
		parser = new DOMParser();
		try
		{
			xmlDoc = parser.parseFromString(xmlString ,"text/xml");
			if(xmlDoc.getElementsByTagName("parsererror").length > 0 )
			{
				extractDOMErrorText(xmlDoc.getElementsByTagName("parsererror")[0].innerText, docType);
				xmlDoc = false ;
			}
		}
		catch(e)
		{
			alert("---------------\nInvalid "+docType+" :\n---------------\nError occured while parsing the "+docType);
			xmlDoc = false ;
		}
	}
	else
	{
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = false;
		xmlDoc.loadXML(xmlString);
		if(xmlDoc.parseError.errorCode != 0 )
		{
			alert("Invalid" + docType +" : "+xmlDoc.parseError.reason+"\nLineNumber : "
			+xmlDoc.parseError.line+"\nPosition : "+xmlDoc.parseError.linepos);
			xmlDoc = false ;
		}
	}
	return xmlDoc;
}

function xmlParsingWithoutErr(xmlString)
{
	var xmlDoc;
	if (window.DOMParser)
	{
		parser = new DOMParser();
		try
		{
			xmlDoc = parser.parseFromString(xmlString ,"text/xml");
			if(xmlDoc.getElementsByTagName("parsererror").length > 0 ){xmlDoc = false;}
		}
		catch(e)
		{
			xmlDoc = false ;
		}
	}
	else
	{
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = false;
		xmlDoc.loadXML(xmlString); 
		if(xmlDoc.parseError.errorCode != 0 ){xmlDoc = false;}
	}
	return xmlDoc;
}

function transform()
{
	var xsltDataString        = document.getElementById("xsltData").value;
	var inputXmlDataString    = document.getElementById("inputXmlData").value;
	var xsltData, inputXml, transformedXml ;
	
	inputXml = xmlParsing(inputXmlDataString, 'XML');
	if(inputXml)
	{
		xsltData = xmlParsing(xsltDataString, 'XSLT');
	}
	
	if(xsltData)
	{
		var startTime = new Date().getTime();
		if (window.DOMParser)
		{
			if(document.implementation && document.implementation.createDocument)
			{
				var xsltProcessor=new XSLTProcessor();
				xsltProcessor.importStylesheet(xsltData);
				var resultDocument = xsltProcessor.transformToDocument(inputXml);
				//xsltProcessor.showWarnings(true);
				//xsltProcessor.setErrorStream(System.err);
				if(resultDocument == null)
				{
					alert("---------------\nWrong XSLT :\n---------------\nCannot Transform the Input XML");
				}
				else
				{
					transformedXML = new XMLSerializer().serializeToString(resultDocument);
				}
			}
		}
		else
		{
			try{transformedXML = inputXml.transformNode(xsltData);}
			catch(err){alert(err.message);}
		}
		var endTime = new Date().getTime();
	
		document.getElementById("outputXmlData").value = formatXmlWithoutErr(formatXml(transformedXML, '')) ;
		document.getElementById("timerValue").innerHTML = "Time Taken To Transform : "+(endTime-startTime)/1000 + " sec" ;
	}
}

function formatTextArea(textAreaId)
{
	var rawXmlData = document.getElementById(textAreaId).value ;
	var docType;
	if (textAreaId == 'xsltData')
	{
		docType = 'XSLT';
	}
	else if(textAreaId == 'inputXmlData')
	{
		docType = 'XML';
	}
	
	document.getElementById(textAreaId).value = formatXmlWithoutErr(formatXml(rawXmlData,docType)) ;
}

function formatXml(rawXmlData, docType) 
{
	var formattedXmlData = "" ;
	var indentCount = -1 ;
	var xmlDoc = xmlParsing(rawXmlData, docType);
	
	if(xmlDoc)
	{
		var cleanedRawData = rawXmlData.replace(/>\s*</g,"><").replace(/\n/g,"");
		xmlDoc = xmlParsing(cleanedRawData, docType);
		formattedXmlData = funcIterate(xmlDoc, formattedXmlData,indentCount).substring(1);
	}
	else
	{
		formattedXmlData = rawXmlData;
	}
	
	return formattedXmlData ;
}

function formatXmlWithoutErr(rawXmlData) 
{
	var formattedXmlData = "" ;
	var indentCount = -1 ;
	var cleanedRawData = rawXmlData.replace(/>\s*</g,"><").replace(/\n/g,"");
	var xmlDoc = xmlParsingWithoutErr(cleanedRawData);
	
	if(xmlDoc)
	{
		formattedXmlData = funcIterate(xmlDoc, formattedXmlData,indentCount).substring(1);
	}
	else
	{
		formattedXmlData = rawXmlData;
	}
	
	return formattedXmlData ;
}

function funcIterate(item,outputXml,indentCount)
{
	var currentItem = item.firstChild ;
	while(currentItem)
	{
		indentCount = indentCount + 1 ;
		outputXml += openingTag(currentItem,indentCount) ;
		if(currentItem.hasChildNodes())
		{	
			outputXml = funcIterate(currentItem,outputXml,indentCount) ;
		}
		else
		{
			outputXml += (currentItem.nodeValue || "").replace(/^\s+|\s+$/g, "");
			flag = false; 
		}
		outputXml += closingTag(currentItem,indentCount);
		indentCount = indentCount - 1 ;
		currentItem = currentItem.nextSibling ;
	}
	return outputXml ;
}

function closingTag(currentItem,indentCount)
{
	var returnString = "" ;
	if(flag)
	{
		switch(currentItem.nodeType)
		{
			case 4 : returnString = "]]>" ; break;
			case 8 : returnString = "-->" ; break;
			case 7 : returnString = "?>" ; break;
			case 3 : returnString = "" ; break;
			default : returnString ="\n"+padding(indentCount)+"</"+ currentItem.nodeName +">" ;
		}
	}
	else
	{
		switch(currentItem.nodeType)
		{
			case 4 : returnString = "]]>"; flag = true ; break;
			case 8 : returnString = "-->" ; flag = true ; break;
			case 7 : returnString = " ?>" ; flag = true ; break;
			case 3 : returnString = "" ; break;
			default : returnString ="</"+ currentItem.nodeName +">" ; flag = true ;
		}
	}
	return returnString ;
}

function openingTag(currentItem,indentCount)
{
	var returnString = "" ;
	switch(currentItem.nodeType)
	{
		case 4 : returnString = "\n"+padding(indentCount)+"<![CDATA[" ; break;
		case 8 : returnString = "\n"+padding(indentCount)+"<!--" ; break;
		case 7 : returnString ="\n"+padding(indentCount)+"<\?"+ currentItem.nodeName + " " ; break ;
		case 3 : returnString = "" ; break;
		default : returnString ="\n"+padding(indentCount)+"<"+ currentItem.nodeName + getAttributesNameValue(currentItem) +">" ;
	}
	return returnString ;
}

function getAttributesNameValue(currentItem)
{
	var resultString = "";
	var attributeList = currentItem.attributes ;
	if(attributeList)
	{
		for(var i=0; i<attributeList.length; i++)
		{
			resultString += " " + attributeList[i].name + "=\"" + attributeList[i].value + "\"" ;
		}
	}
	return resultString ;
}

function padding(indentCount)
{
	var resultString = "";
	var indentLevel = document.getElementById("indentBox").value;
	for(var i=0; i<(indentCount*indentLevel); i++)
	{
		resultString += " " ;
	}
	return resultString ;
}

function deleteEmptyNodesFromTextArea(textAreaId)
{
	var rawXmlData = document.getElementById(textAreaId).value ;
	var outputXml = "" ;
	var indentCount = -1 ;
	var docType;
	if (textAreaId == 'xsltData'){docType = 'XSLT';}
	else if(textAreaId == 'inputXmlData'){docType = 'XML';}
	
	var cleanedRawData = rawXmlData.replace(/>\s*</g,"><").replace(/\n/g,"");
	var xmlDoc = xmlParsing(cleanedRawData, docType);		
	if(xmlDoc)
	{
		outputXml += deleteEmptyNodes(xmlDoc, outputXml,indentCount).substring(1) ;
	}
	else
	{
		outputXml += rawXmlData ;
	}		
	document.getElementById(textAreaId).value = outputXml ;
}

function deleteEmptyNodes(item,outputXml,indentCount)
{
	var currentItem = item.firstChild ;
	while(currentItem)
	{
		if(currentItem.textContent != "")
		{
			indentCount = indentCount + 1 ;
			outputXml += openingTag(currentItem,indentCount) ;
			
			if(currentItem.hasChildNodes())
			{	
				outputXml = deleteEmptyNodes(currentItem,outputXml,indentCount) ;
			}
			else
			{
				outputXml += currentItem.nodeValue || "";
				flag = false; 
			}
			outputXml += closingTag(currentItem,indentCount);
			indentCount = indentCount - 1 ;
		}
		currentItem = currentItem.nextSibling ;
	}
	return outputXml ;
}

function deleteCommentsFromTextArea(textAreaId)
{
	var rawXmlData = document.getElementById(textAreaId).value ;
	var outputXml = "" ;
	var indentCount = -1 ;
	var docType;
	if (textAreaId == 'xsltData')
	{
		docType = 'XSLT';
	}
	else if(textAreaId == 'inputXmlData')
	{
		docType = 'XML';
	}
	
	var cleanedRawData = rawXmlData.replace(/>\s*</g,"><").replace(/\n/g,"");
	var xmlDoc = xmlParsing(cleanedRawData, docType);		
	if(xmlDoc)
	{
		outputXml = deleteComments(xmlDoc, outputXml,indentCount).substring(1);
	}
	else
	{
		outputXml += rawXmlData;
	}
	document.getElementById(textAreaId).value = outputXml ;
}

function deleteComments(item,outputXml,indentCount)
{
	var currentItem = item.firstChild ;
	while(currentItem)
	{
		if(currentItem.nodeType != 8)
		{
			indentCount = indentCount + 1 ;
			outputXml += openingTag(currentItem,indentCount) ;
			if(currentItem.hasChildNodes())
			{	
				outputXml = deleteComments(currentItem,outputXml,indentCount) ;
			}
			else
			{
				outputXml += currentItem.nodeValue || "";
				flag = false; 
			}
			outputXml += closingTag(currentItem,indentCount);
			indentCount = indentCount - 1 ;
		}
		currentItem = currentItem.nextSibling ;
	}
	return outputXml ;
}

function extractDOMErrorText(errorText, docType)
{
	var tempText = errorText.substring(errorText.indexOf(":")+1);
	var mainErrorBody = tempText.substring(0, tempText.indexOf("\n"));
	var positionText = mainErrorBody.substring(0, mainErrorBody.indexOf(":"));
	var reasonText = mainErrorBody.substring(mainErrorBody.indexOf(":")+1);
	var alertText = "";
	alertText = alertText + "-------------------------------------------\n";
	alertText = alertText + "Error Occurred While Parsing : "+ docType + "\n";
	alertText = alertText + "-------------------------------------------\n";
	alertText = alertText + "Error Position :  " + positionText + "\n";
	alertText = alertText + "Error Reason  : " + reasonText;
	alert(alertText);
}

function makeLinearXML(textAreaId)
{
	var rawXmlData = document.getElementById(textAreaId).value ;
	var docType;
	if (textAreaId == 'xsltData')
	{
		docType = 'XSLT';
	}
	else if(textAreaId == 'inputXmlData')
	{
		docType = 'XML';
	}

	document.getElementById(textAreaId).value = formatXmlWithoutErr(formatXml(rawXmlData,docType)).replace(/>\s*</g,"><");
}

