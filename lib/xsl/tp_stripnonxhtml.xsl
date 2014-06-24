<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0"
	xmlns:html="http://www.w3.org/1999/xhtml">

	<!-- Make sure that we put the content of 'style' and 'script' elements
			into CDATA sections. This helps when we end up converting output
			from this into an HTML string and strip the CDATA sections,
			where we don't actually want this text content entitiefied. -->
	<xsl:output cdata-section-elements="html:style html:script"/>
	
	<!-- The 'identity transformation', which copies all nodes and attributes
			to the output -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

	<!-- Rip out any text node whose parent is not in the XHTML namespace. -->
	<xsl:template match="*[namespace-uri() != 'http://www.w3.org/1999/xhtml']/text()">
		<xsl:apply-templates select="@*|node()"/>
	</xsl:template>

	<!-- Rip out any node that's not in the XHTML namespace. -->
	<xsl:template match="*[namespace-uri() != 'http://www.w3.org/1999/xhtml']">
		<xsl:apply-templates select="@*|node()"/>
	</xsl:template>

	<!-- Copy over all attributes, but any with ':' will have lost their prefix
			because we said 'method="html"' above. We want those prefixes to
			remain, even though HTML won't think of them as that (it thinks of
			the whole attribute name as including the colon) because we use
			them for other things. -->
	<xsl:template match="@*">
		<xsl:variable name="attrName" select="name()"/>
		<xsl:choose>
			<xsl:when test="contains($attrName,':')">
				<xsl:attribute name="{concat(substring-before($attrName,':'),'_colon_',substring-after($attrName,':'))}">
					<xsl:value-of select="."/>
				</xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:attribute name="{$attrName}">
					<xsl:value-of select="."/>
				</xsl:attribute>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

</xsl:stylesheet>
