<?xml version="1.0" encoding="UTF-8"?>

<!--
-->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:svg="http://www.w3.org/2000/svg"
	xmlns:v="urn:schemas-microsoft-com:vml" xmlns:tibet="http://www.technicalpursuit.com/1999/tibet"
	xmlns:html="http://www.w3.org/1999/xhtml" xmlns:xlink="http://www.w3.org/1999/xlink"
	xmlns:msxsl="urn:schemas-microsoft-com:xslt" xmlns:js="urn:ecma:262-3">

	<!-- The 'identity transformation', which copies all nodes and attributes
			to the output -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

	<!-- Script functions to make certain things easier. Note that this is proprietary to the MSXML engine, but
		since this stylesheet is meant to run in IE, that's not a problem :-) -->
	<msxsl:script type="text/javascript" implements-prefix="tibet">
		<![CDATA[
		function extractStyleValue(styleString, propertyName)
		{
			var		propRegExp;

			if ((!styleString) || styleString == '')
			{
				return '';
			};
		
			propRegExp = new RegExp('\\s*' + propertyName + '\\s*:\\s*(\\S+)\\s*;?');
		
			if (propRegExp.test(styleString) == true)
			{
				return propRegExp.exec(styleString)[1].replace(/;/,'');
			};
		
			return '';
		};

		function lengthToPx(aValue)
		{
			var		pixelsInPoint;
			var		numValue;

			if (aValue.length == 0)
			{
				return '0px';
			};
		
			pixelsInPoint = 1.3333333;

			numValue = parseFloat(aValue);

			if (aValue.length > 2)
			{
				switch(aValue.slice(-2))
				{
					case	'px':
						return aValue;
					break;
					case	'pt':
						return numValue * pixelsInPoint + 'px';
					break;
					case	'in':
						return numValue * 72 * pixelsInPoint + 'px';
					break;
					case	'pc':
						return numValue * 12 * pixelsInPoint + 'px';
					break;
					case	'mm':
						return numValue / (7.2 / 2.54) * pixelsInPoint + 'px';
					break;
					case	'cm':
						return numValue / (72 / 2.54) * pixelsInPoint + 'px';
					break;
				};
			};

			//	It was a number of pixels (the default in SVG is pixels)
			return parseFloat(aValue) + 'px';
		};

		function getGradientColorInfo(gradientElementResultSet)
		{
			var		aGradientElement;
			var		stopElems;
		
			var		resultStr;
			var		i;

			aGradientElement = gradientElementResultSet.nextNode();

			stopElems = aGradientElement.selectNodes('.//*[local-name() = "stop"]');

			resultStr = [];

			for (i = 0; i < stopElems.length; i++)
			{
				resultStr.push(stopElems[i].getAttribute('offset'),
								' ',
								extractStyleValue(stopElems[i].getAttribute('style'),
													'stop-color'),
								',');
			};

			resultStr.pop();
			return resultStr.join('');
		};

		function computeGradientAngle(gradientElementResultSet)
		{
			var		aGradientElement;

			var		x1;
			var		y1;
			var		x2;
			var		y2;

			aGradientElement = gradientElementResultSet.nextNode();
		
			if (!(x1 = aGradientElement.getAttribute('x1')) ||
				!(y1 = aGradientElement.getAttribute('y1')) ||
				!(x2 = aGradientElement.getAttribute('x2')) ||
				!(y2 = aGradientElement.getAttribute('y2')))
			{
				return 90;
			};

			x1 = parseInt(x1) / 100;
			y1 = parseInt(y1) / 100;
			x2 = parseInt(x2) / 100;
			y2 = parseInt(y2) / 100;

			return (Math.atan2(x2 - x1, y2 - y1) * 180 / Math.PI) % 360;
		};
		]]>
	</msxsl:script>

	<!-- 'svg:svg' element -->
	<xsl:template match="svg:svg">
		<xsl:variable name="theWidth">
			<xsl:choose>
				<xsl:when test="not(@width) or @width = ''">100%</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="@width"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="theHeight">
			<xsl:choose>
				<xsl:when test="not(@height) or @height = ''">100%</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="@height"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<html:span>
		<!-- TODO: Figure out what's going on here and why this doesn't work
		<v:group style="width: {$theWidth}; height: {$theHeight}" coordorigin="0px 0px" coordsize="{$theWidth} {$theHeight}">
	
			<v:rect style="left: 0px; top: 0px; width: {$theWidth}; height: {$theHeight}" filled="false" stroked="false">
				<xsl:apply-templates/>
			</v:rect>

		</v:group>
		-->
			<xsl:apply-templates/>
		</html:span>

	</xsl:template>

	<!-- Elements that shouldn't be reflected into the destination document because either they're invisible, or we
			don't support them. -->
	<xsl:template match="svg:g|svg:use|svg:defs|svg:linearGradient|svg:radialGradient|svg:stop"/>	
	
	<!-- 'svg:rect' element -->
	<xsl:template match="svg:rect">

		<v:rect id="{@id}" style="left: {tibet:lengthToPx(string(@x))}; top: {tibet:lengthToPx(string(@y))}; width: {tibet:lengthToPx(string(@width))}; height: {tibet:lengthToPx(string(@height))}">
			<xsl:call-template name="extractStrokeInformation">
				<xsl:with-param name="svgstyle" select="@style"/>
			</xsl:call-template>

			<xsl:call-template name="extractFillInformation">
				<xsl:with-param name="svgstyle" select="@style"/>
			</xsl:call-template>
		</v:rect>

	</xsl:template>

	<!-- Utility templates -->
	<xsl:template name="extractStrokeInformation">
		<xsl:param name="svgstyle" select="''"/>

		<!-- Note how we give some default values here. Constructs below may override these. -->
		<v:stroke endcap="flat" joinstyle="miter" miterlimit="4" dashstyle="solid" opacity="1">

			<!-- 'stroke-width' becomes 'weight' -->

			<!-- Any value in the style takes precedence over the same presentation attribute -->
			<xsl:choose>
				<xsl:when test="contains($svgstyle,'stroke-width:')">
					<xsl:attribute name="weight">
						<xsl:value-of select="tibet:lengthToPx(string(tibet:extractStyleValue(string($svgstyle),'stroke-width')))"/>
					</xsl:attribute>
				</xsl:when>
				<xsl:when test="@stroke-width">
					<xsl:attribute name="weight">
						<xsl:value-of select="tibet:lengthToPx(string(@stroke-width))"/>
					</xsl:attribute>
				</xsl:when>
			</xsl:choose>
			
			
			<!-- 'stroke-linecap' becomes 'endcap' -->

			<!-- Any value in the style takes precedence over the same presentation attribute -->
			<xsl:variable name="linecapValue">
				<xsl:choose>
					<xsl:when test="contains($svgstyle,'stroke-linecap:')">
						<xsl:value-of select="tibet:extractStyleValue(string($svgstyle),'stroke-linecap')"/>
					</xsl:when>
					<xsl:when test="@stroke-linecap">
						<xsl:value-of select="@stroke-linecap"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>

			<xsl:if test="$linecapValue != ''">
				<xsl:attribute name="endcap">
					<xsl:choose>
						<xsl:when test="$linecapValue = 'butt'">
							<xsl:text>flat</xsl:text>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="$linecapValue"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:attribute>
			</xsl:if>

			<!-- 'stroke-linejoin' becomes 'joinstyle' -->

			<!-- Any value in the style takes precedence over the same presentation attribute -->
			<xsl:choose>
				<xsl:when test="contains($svgstyle,'stroke-linejoin:')">
					<xsl:attribute name="joinstyle">
						<xsl:value-of select="tibet:extractStyleValue(string($svgstyle),'stroke-linejoin')"/>
					</xsl:attribute>
				</xsl:when>
				<xsl:when test="@stroke-linejoin">
					<xsl:attribute name="joinstyle">
						<xsl:value-of select="@stroke-linejoin"/>
					</xsl:attribute>
				</xsl:when>
			</xsl:choose>

			<!-- 'stroke-miterlimit' becomes 'miterlimit' -->

			<!-- Any value in the style takes precedence over the same presentation attribute -->
			<xsl:choose>
				<xsl:when test="contains($svgstyle,'stroke-miterlimit:')">
					<xsl:attribute name="miterlimit">
						<xsl:value-of select="tibet:extractStyleValue(string($svgstyle),'stroke-miterlimit')"/>
					</xsl:attribute>
				</xsl:when>
				<xsl:when test="@stroke-miterlimit">
					<xsl:attribute name="miterlimit">
						<xsl:value-of select="@stroke-miterlimit"/>
					</xsl:attribute>
				</xsl:when>
			</xsl:choose>

			<!-- 'stroke-dasharray' becomes 'dashstyle' -->

			<!-- Any value in the style takes precedence over the same presentation attribute -->
			<xsl:choose>
				<xsl:when test="contains($svgstyle,'stroke-dasharray:')">
					<xsl:attribute name="dashstyle">
						<xsl:value-of select="tibet:extractStyleValue(string($svgstyle),'stroke-dasharray')"/>
					</xsl:attribute>
				</xsl:when>
				<xsl:when test="@stroke-dasharray">
					<xsl:attribute name="dashstyle">
						<xsl:value-of select="@stroke-dasharray"/>
					</xsl:attribute>
				</xsl:when>
			</xsl:choose>

			<!-- 'stroke-dashoffset' becomes 'dashoffset' -->

			<!-- Any value in the style takes precedence over the same presentation attribute -->
			<xsl:choose>
				<xsl:when test="contains($svgstyle,'stroke-dashoffset:')">
					<xsl:attribute name="dashoffset">
						<xsl:value-of select="tibet:extractStyleValue(string($svgstyle),'stroke-dashoffset')"/>
					</xsl:attribute>
				</xsl:when>
				<xsl:when test="@stroke-dashoffset">
					<xsl:attribute name="dashoffset">
						<xsl:value-of select="@stroke-dashoffset"/>
					</xsl:attribute>
				</xsl:when>
			</xsl:choose>

			<!-- 'stroke-opacity' becomes 'opacity' -->

			<!-- Any value in the style takes precedence over the same presentation attribute -->
			<xsl:choose>
				<xsl:when test="contains($svgstyle,'stroke-opacity:')">
					<xsl:attribute name="opacity">
						<xsl:value-of select="tibet:extractStyleValue(string($svgstyle),'stroke-opacity')"/>
					</xsl:attribute>
				</xsl:when>
				<xsl:when test="@stroke-opacity">
					<xsl:attribute name="opacity">
						<xsl:value-of select="@stroke-opacity"/>
					</xsl:attribute>
				</xsl:when>
			</xsl:choose>

			<!-- Finally, the 'stroke' declaration must have a value in order for the stroke to
					be "on". Note also that, in VML, strokes don't support gradients, so we filter for that
					here. -->

			<!-- Any value in the style takes precedence over the same presentation attribute -->
			<xsl:variable name="strokeValue">
				<xsl:choose>
					<xsl:when test="contains($svgstyle,'stroke:')">
						<xsl:value-of select="tibet:extractStyleValue(string($svgstyle),'stroke')"/>
					</xsl:when>
					<xsl:when test="@stroke">
						<xsl:value-of select="@stroke"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>

			<xsl:choose>
				<xsl:when test="$strokeValue != '' and $strokeValue != 'none' and not(contains($strokeValue,'url'))">
					<!-- Turn 'on' to 'true' -->
					<xsl:attribute name="on">true</xsl:attribute>
					<!-- 'stroke' becomes 'color' -->
					<xsl:attribute name="color">
						<xsl:value-of select="$strokeValue"/>
					</xsl:attribute>
				</xsl:when>
				<xsl:otherwise>
					<!-- Turn 'on' to 'false' -->
					<xsl:attribute name="on">false</xsl:attribute>
				</xsl:otherwise>
			</xsl:choose>

		</v:stroke>

	</xsl:template>

	<xsl:template name="extractFillInformation">
		<xsl:param name="svgstyle" select="''"/>

		<!-- Note how we give some default values here. Constructs below may override these. -->
		<v:fill opacity="1">

			<!-- 'fill-opacity' becomes 'opacity' -->

			<!-- Any value in the style takes precedence over the same presentation attribute -->
			<xsl:choose>
				<xsl:when test="contains($svgstyle,'fill-opacity:')">
					<xsl:attribute name="opacity">
						<xsl:value-of select="tibet:extractStyleValue(string($svgstyle),'fill-opacity')"/>
					</xsl:attribute>
				</xsl:when>
				<xsl:when test="@fill-opacity">
					<xsl:attribute name="opacity">
						<xsl:value-of select="@fill-opacity"/>
					</xsl:attribute>
				</xsl:when>
			</xsl:choose>

			<!-- Finally, the 'fill' declaration must have a value in order for the fill to
				be "on". -->

			<!-- Any value in the style takes precedence over the same presentation attribute -->
			<xsl:variable name="fillValue">
				<xsl:choose>
					<xsl:when test="contains($svgstyle,'fill:')">
						<xsl:value-of select="tibet:extractStyleValue(string($svgstyle),'fill')"/>
					</xsl:when>
					<xsl:when test="@fill">
						<xsl:value-of select="@fill"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>

			<xsl:choose>
				<xsl:when test="$fillValue != '' and $fillValue != 'none'">
					<!-- Turn 'on' to 'true' -->
					<xsl:attribute name="on">true</xsl:attribute>

					<xsl:choose>

						<!-- If the fill doesn't contain a gradient, then its easy -->
						<xsl:when test="not(contains($fillValue,'url'))">
							<!-- 'fill' becomes 'color' -->
							<xsl:attribute name="color">
								<xsl:value-of select="$fillValue"/>
							</xsl:attribute>
						</xsl:when>
						<xsl:otherwise>
							<xsl:call-template name="processGradient">
								<xsl:with-param name="gradientID"
									select="substring-before(substring-after($fillValue,'#'),')')"/>
							</xsl:call-template>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:when>

				<xsl:otherwise>
					<!-- Turn 'on' to 'false' -->
					<xsl:attribute name="on">false</xsl:attribute>
				</xsl:otherwise>
			</xsl:choose>

		</v:fill>

	</xsl:template>

	<xsl:template name="processGradient">
		<xsl:param name="gradientID" select="''"/>

		<xsl:variable name="gradientElement" select="//*[@id = $gradientID]"/>

		<xsl:choose>
			<xsl:when test="local-name($gradientElement) = 'linearGradient'">
				<xsl:attribute name="colors">
					<xsl:value-of select="tibet:getGradientColorInfo($gradientElement)"/>
				</xsl:attribute>
				<xsl:attribute name="type">gradient</xsl:attribute>
				<xsl:attribute name="method">sigma</xsl:attribute>
				<xsl:attribute name="angle">
					<xsl:value-of select="tibet:computeGradientAngle($gradientElement)"/>
				</xsl:attribute>
				<xsl:attribute name="focussize">0 0</xsl:attribute>
				<xsl:attribute name="focus">100%</xsl:attribute>
				<xsl:attribute name="focusposition">50% 50%</xsl:attribute>
			</xsl:when>
			<xsl:when test="local-name($gradientElement) = 'radialGradient'">
				<xsl:attribute name="colors">
					<xsl:value-of select="tibet:getGradientColorInfo($gradientElement)"/>
				</xsl:attribute>
				<xsl:attribute name="type">gradientradial</xsl:attribute>
				<xsl:attribute name="method">sigma</xsl:attribute>
				<xsl:attribute name="angle">-45</xsl:attribute>
				<xsl:attribute name="focussize">0 0</xsl:attribute>
				<xsl:attribute name="focus">100%</xsl:attribute>
				<xsl:attribute name="focusposition">50% 50%</xsl:attribute>
			</xsl:when>
		</xsl:choose>

	</xsl:template>

</xsl:stylesheet>
