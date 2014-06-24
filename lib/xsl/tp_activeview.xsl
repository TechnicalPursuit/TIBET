<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:html="http://www.w3.org/1999/xhtml"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<xsl:template match="/">
		<html:ul>
			<xsl:apply-templates />
		</html:ul>
	</xsl:template>

	<xsl:template match="text()"/>

	<xsl:template match="book/title">
		<html:li>
			<xsl:value-of select="."/>
		</html:li>
	</xsl:template>

</xsl:stylesheet>
