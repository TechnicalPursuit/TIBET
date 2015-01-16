<?xml version="1.0" encoding="UTF-8"?>

<!-- Creates a collapsible node tree in the manner of Internet Explorer -->
<!-- Author: Dave Lindquist (http://www.gazingus.org) -->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:output method="xml" indent="yes" doctype-public="-//W3C//DTD HTML 4.01//EN" doctype-system="http://www.w3.org/TR/html4/strict.dtd"></xsl:output>

	<xsl:template match="/">
		<html>
			<head>
				<title></title>
				<style type="text/css">
					html
					{
						border: none;
					}
					body
					{
						color: #0000FF;
						font: 12px Tahoma, Verdana, Arial, Helvetica,sans-serif;
						margin: 0px;
						padding: 15px 75px 15px 10px;
						height: 100%;

						overflow: -moz-scrollbars-horizontal !important;
					}
					ul
					{
						padding-left: 40px;
						margin: 0px;
						list-style: none outside;
					}
					li
					{
						list-style: none outside;
						margin-left: -28px;
						line-height: 1.25em;
					}
					.switch
					{
						color: #FF0000;
						font-family: "Lucida Typewriter","Lucida Console", Courier, monospace;
						padding-right: 5px;
					}
					.element
					{
						color: #990000;
					}
					.comment
					{
						color: #999999;
						font-family: "Lucida Typewriter","Lucida Console",Courier,monospace;
					}
					.text
					{
						color: #000000;
						font-weight: bold;
					}
					.processing-instruction
					{
					}
					.attribute-key
					{
						color: #990000;
					}
					.attribute-value
					{
						color: #000000;
						font-weight: bold;
					}
					.namespace-key
					{
						color: #FF0000;
					}
					.namespace-value
					{
						color: #FF0000;
						font-weight: bold;
					}
					a.parent-element
					{
						color: #0000FF;
						text-decoration: none;
						width: 100%;
						margin-left: -13px;
					}
				</style>
				<script type="text/javascript">
				<xsl:comment>
					<![CDATA[
					function switchNode(nodeRef)
					{
							var div = nodeRef.parentNode.getElementsByTagName("div").item(0);
							var span = nodeRef.getElementsByTagName("span").item(0);
							var display = div.style.display;
							var symbol = (display == "none") ? "-" : "+";
							div.style.display = (display == "none") ? "block" : "none";
							span.replaceChild(document.createTextNode(symbol),span.childNodes.item(0));
					}
					]]>
				</xsl:comment>
				</script>
			</head>
			<body>
				<ul>
					<xsl:apply-templates></xsl:apply-templates>
				</ul>
			</body>
		</html>
	</xsl:template>

	<xsl:template match="*">
		<li>
			<xsl:choose>
				<xsl:when test="count(text()) = 1 and count(*) = 0 and count(comment()) = 0 and count(processing-instruction()) = 0">
					<xsl:text>&lt;</xsl:text>
					<span class="element">
						<xsl:value-of select="name()"></xsl:value-of>
					</span>
					<xsl:apply-templates select="@*"></xsl:apply-templates>
					<xsl:if test=". = /">
						<xsl:for-each select="namespace::*">
							<xsl:call-template name="namespace-node"></xsl:call-template>
						</xsl:for-each>
					</xsl:if>
					<xsl:call-template name="text-only"></xsl:call-template>
				</xsl:when>
				<xsl:when test="*|comment()|processing-instruction()">
					<a href="javascript:void 0" onclick="switchNode(this);return false" class="parent-element">
						<span class="switch">-</span>
						<xsl:text>&lt;</xsl:text>
						<span class="element">
							<xsl:value-of select="name()"></xsl:value-of>
						</span>
						<xsl:apply-templates select="@*"></xsl:apply-templates>
						<xsl:if test=". = /">
							<xsl:for-each select="namespace::*">
								<xsl:call-template name="namespace-node"></xsl:call-template>
							</xsl:for-each>
						</xsl:if>
						<xsl:text>&gt;</xsl:text>
					</a>
					<div>
						<ul>
							<xsl:apply-templates></xsl:apply-templates>
						</ul>
						<xsl:text>&lt;/</xsl:text>
						<span class="element">
							<xsl:value-of select="name()"></xsl:value-of>
						</span>
						<xsl:text>&gt;</xsl:text>
					</div>
				</xsl:when>
				<xsl:otherwise>
					<xsl:text>&lt;</xsl:text>
					<span class="element">
						<xsl:value-of select="name()"></xsl:value-of>
					</span>
					<xsl:apply-templates select="@*"></xsl:apply-templates>
					<xsl:if test=". = /">
						<xsl:for-each select="namespace::*">
							<xsl:call-template name="namespace-node"></xsl:call-template>
						</xsl:for-each>
					</xsl:if>
					<xsl:text> /&gt;</xsl:text>
					<xsl:apply-templates></xsl:apply-templates>
				</xsl:otherwise>
			</xsl:choose>
		</li>
	</xsl:template>

	<xsl:template match="@*[starts-with(name(),'tibet_XSLTNSHack')]">
		<xsl:text> </xsl:text>
		<span class="attribute-key">
			<xsl:choose>
				<xsl:when test="name() = 'tibet_XSLTNSHack__xmlns'">
					<xsl:value-of select="'xmlns'"></xsl:value-of>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="concat('xmlns:',substring-after(name(),'tibet_XSLTNSHack__'))"></xsl:value-of>
				</xsl:otherwise>
			</xsl:choose>
		</span>
		<xsl:text>=&quot;</xsl:text>
		<span class="attribute-value">
			<xsl:value-of select="."></xsl:value-of>
		</span>
		<xsl:text>&quot;</xsl:text>
	</xsl:template>

	<xsl:template match="@*">
		<xsl:text> </xsl:text>
		<span class="attribute-key">
			<xsl:value-of select="name()"></xsl:value-of>
		</span>
		<xsl:text>=&quot;</xsl:text>
		<xsl:if test="string-length(.) != 0">
			<span class="attribute-value">
				<xsl:value-of select="."></xsl:value-of>
			</span>
		</xsl:if>
		<xsl:text>&quot;</xsl:text>
	</xsl:template>

	<xsl:template match="comment()">
		<li>
			<xsl:text>&lt;!-- </xsl:text>
			<span class="comment">
				<xsl:value-of select="."></xsl:value-of>
			</span>
			<xsl:text> --&gt;</xsl:text>
		</li>
	</xsl:template>

	<xsl:template match="processing-instruction()">
		<li>
			<xsl:text>&lt;?</xsl:text>
			<xsl:value-of select="name()"></xsl:value-of>
			<xsl:text> </xsl:text>
			<xsl:value-of select="."></xsl:value-of>
			<xsl:text>?&gt;</xsl:text>
		</li>
	</xsl:template>

	<xsl:template match="text()">
		<xsl:if test="string-length(normalize-space(.))">
			<li class="text">
				<xsl:value-of select="normalize-space(.)"></xsl:value-of>
			</li>
		</xsl:if>
	</xsl:template>

	<xsl:template name="text-only">
		<xsl:choose>
			<xsl:when test="string-length(normalize-space(.))">
				<xsl:text>&gt;</xsl:text>
				<span class="text">
					<xsl:value-of select="normalize-space(.)"></xsl:value-of>
				</span>
				<xsl:text>&lt;/</xsl:text>
				<span class="element">
					<xsl:value-of select="name()"></xsl:value-of>
				</span>
				<xsl:text>&gt;</xsl:text>
			</xsl:when>
			<xsl:otherwise>
				<xsl:text> /&gt;</xsl:text>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="namespace-node">
		<xsl:if test="name() != 'xml'">
			<span class="namespace-key">
				<xsl:text> xmlns:</xsl:text>
				<xsl:value-of select="name()"></xsl:value-of>
			</span>
			<xsl:text>=&quot;</xsl:text>
			<span class="namespace-value">
				<xsl:value-of select="."></xsl:value-of>
			</span>
			<xsl:text>&quot;</xsl:text>
		</xsl:if>
	</xsl:template>

</xsl:stylesheet>
