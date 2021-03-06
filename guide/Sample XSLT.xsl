<xsl:stylesheet version="1.0" id="TCPASearchReq" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://services.metlife.com/standards/svcinfo/v1" xmlns:oas="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:urn="urn:com.metlife.ead.channels.services.contract.contractV5" xmlns:pol="http://MetLife/CMM/Policy" xmlns:ws="http://www.informatica.com/dis/ws/">
	<xsl:output method="xml" omit-xml-declaration="yes"/>
	<xsl:template match="/">
		<soapenv:Envelope>
			<soapenv:Header>
				<oas:Security>
					<oas:UsernameToken>
						<oas:Username>
							<xsl:value-of select="/soapenv:Envelope/soapenv:Header/oas:Security/oas:UsernameToken/oas:Username"/>
						</oas:Username>
						<oas:Password>
							<xsl:value-of select="/soapenv:Envelope/soapenv:Header/oas:Security/oas:UsernameToken/oas:Password"/>
						</oas:Password>
					</oas:UsernameToken>
				</oas:Security>
			</soapenv:Header>
			<soapenv:Body>
				<ws:Tcpa_Consent_Rpt>
					<xsl:for-each select="//urn:searchContractList/pol:Search/pol:CriteriaExpression/pol:Criteria">
						<xsl:if test="pol:PropertyName = 'Met_PrivacyConsentEffDate'">
							<ws:StartDate>
								<xsl:value-of select="pol:PropertyValue"/>
							</ws:StartDate>
						</xsl:if>
						<xsl:if test="pol:PropertyName = 'Met_PrivacyConsentExpDate'">
							<ws:EndDate>
								<xsl:value-of select="pol:PropertyValue"/>
							</ws:EndDate>
						</xsl:if>
					</xsl:for-each>
				</ws:Tcpa_Consent_Rpt>
			</soapenv:Body>
		</soapenv:Envelope>
	</xsl:template>
 </xsl:stylesheet>
