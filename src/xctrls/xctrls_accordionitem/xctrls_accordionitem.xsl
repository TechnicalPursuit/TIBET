<?xml version="1.0" encoding="UTF-8"?>

<!-- This sheet transforms the xctrls:accordionitem element into its final
	 representation. -->

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0"
	xmlns:tibet="http://www.technicalpursuit.com/1999/tibet"
	xmlns:xctrls="http://www.technicalpursuit.com/2005/xcontrols"
	xmlns:tsh="http://www.technicalpursuit.com/1999/tshell"
	xmlns="http://www.w3.org/1999/xhtml">

	<xsl:output method="xml" indent="yes" />

	<!-- Match the root 'tsh:template' element. Here we just reflect the
		 original element but add an attribute. -->
	<xsl:template match="tsh:template">
		<xctrls:accordionitem class="{concat('item ', @class)}">
			<xsl:attribute name="tibet:nodetype">xctrls:accordionitem</xsl:attribute>
			<xsl:apply-templates select="@*|node()"/>
		</xctrls:accordionitem>
	</xsl:template>
	
	<xsl:template match="xctrls:label">
		<xctrls:label>
			<div>
				<xsl:copy-of select="@*|node()"/>
			</div>
		</xctrls:label>
	</xsl:template>
	
	<xsl:template match="xctrls:body">
		<xctrls:body>
			<div>
				<div>
					<xsl:copy-of select="@*|node()"/>
				</div>
			</div>
		</xctrls:body>
	</xsl:template>

	<!-- The classic 'identity transformation', which copies all nodes and
		 attributes to the output. -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

</xsl:stylesheet>
