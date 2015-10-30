<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:html="http://www.w3.org/1999/xhtml"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<xsl:param name="sourceElem"/>

    <xsl:template match="/">
        <result xmlns="">
		    <xsl:copy-of select="$sourceElem"/>
        </result>
	</xsl:template>

</xsl:stylesheet>
