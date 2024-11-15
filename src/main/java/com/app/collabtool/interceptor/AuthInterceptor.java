package com.app.collabtool.interceptor;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class AuthInterceptor implements HandlerInterceptor{

	public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler)
			throws Exception {
		HttpSession session = req.getSession(false);
		if(session.getAttribute("user")!=null) {
			return true;
		}
		else {
			res.sendError(401,"Unauthorized");
			return false;
		}
	}
	
}
