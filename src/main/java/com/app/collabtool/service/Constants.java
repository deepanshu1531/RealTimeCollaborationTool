package com.app.collabtool.service;

import org.springframework.stereotype.Component;

@Component
public class Constants {

	private String local_url = "http://localhost:8000";
	private String network_url = "http://192.168.195.175:8000";
	private String forwarded_url = "https://tcj25l2c-8000.inc1.devtunnels.ms";

	public String getLocal_url() {
		return local_url;
	}

	public void setLocal_url(String local_url) {
		this.local_url = local_url;
	}

	public String getNetwork_url() {
		return network_url;
	}

	public void setNetwork_url(String network_url) {
		this.network_url = network_url;
	}

	public String getForwarded_url() {
		return forwarded_url;
	}

	public void setForwarded_url(String forwarded_url) {
		this.forwarded_url = forwarded_url;
	}

}
