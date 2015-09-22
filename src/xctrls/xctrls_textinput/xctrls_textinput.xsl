<?xml version="1.0" encoding="UTF-8"?>

<!-- This sheet renders the xctrls:textinput element into XHTML. -->

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0"
	xmlns:tibet="http://www.technicalpursuit.com/1999/tibet"
	xmlns:xctrls="http://www.technicalpursuit.com/2005/xcontrols"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:html="http://www.w3.org/1999/xhtml">

	<xsl:output method="xml" indent="yes" />

	<xsl:template match="xctrls:textinput">

		<html:span id="{@id}"
					class="{concat('xctrls-textinput ', @class)}"
					tibet:tag="xctrls:textinput"
					hidefocus="true"
					unselectable="true">

			<!-- Grab the label and put it here inside the overall control -->
			<html:span class="elem_xctrls_label" tibet:tag="xctrls:label">
				<xsl:apply-templates select="xctrls:label"/>
			</html:span>

			<html:input id="{@id}_value" type="text" tibet:pelem="value">

				<!-- If the textinput has an 'xsi:type', then copy it to the
						underlying native control -->
				<xsl:if test="@xsi:type">
					<xsl:attribute name="xsi:type"/>
				</xsl:if>

				<!-- If an 'incremental' attribute wasn't defined on
						the textinput, we default it to 'false',
						otherwise we make sure it is copied over to the
						*tibet* namespace. -->
				<xsl:choose>
					<xsl:when test="not(@incremental)">
						<xsl:attribute name="tibet:incremental" namespace="http://www.technicalpursuit.com/1999/tibet">
							<xsl:text>false</xsl:text>
						</xsl:attribute>
					</xsl:when>
					<xsl:otherwise>
						<xsl:attribute name="tibet:incremental" namespace="http://www.technicalpursuit.com/1999/tibet">
							<xsl:value-of select="@incremental"/>
						</xsl:attribute>
					</xsl:otherwise>
				</xsl:choose>

				<!-- If the textinput is disabled, then disable the
						underlying native control -->
				<xsl:if test="@disabled">
					<xsl:attribute name="disabled"/>
				</xsl:if>

			</html:input>

			<!-- Grab the hint and put it here inside the overall control -->
			<html:span class="elem_xctrls_hint">
				<xsl:apply-templates select="xctrls:hint"/>
			</html:span>

			<!-- Grab any element content other than the label or value and
					place it here inside the main component tag. This allows
					other generated tags, such as those for XML events, to be
					kept with the main tag -->
			<xsl:apply-templates select="*[not((local-name() = 'label' or local-name() = 'hint') and namespace-uri() = 'http://www.technicalpursuit.com/2005/xcontrols')]"/>

		</html:span>
	</xsl:template>

</xsl:stylesheet>
